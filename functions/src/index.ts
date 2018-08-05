import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import { InputValidator } from './InputValidator';
import { Authenticator } from './Authenticator';
import { SuccessCode } from './SuccessCode';
import { ErrorCode } from './ErrorCode';
import { Logger } from './Logger';
import * as fs from 'fs';
import * as path from 'path';
import { RuleInput } from './RuleInput';
import { Log } from './Log';
// import { h, render } from 'preact';
// const cors = require('cors')({ origin: true });

admin.initializeApp();

const app = express();
const db = admin.firestore();
db.settings({
    timestampsInSnapshots: true
});
const auth = admin.auth();
const iv = new InputValidator();
const authenticator = new Authenticator();
const logger = new Logger();
const appLogsRef = db.collection('logs');

const TOKEN = Authenticator.TOKEN_HEADER;

function log(logObj: Log) {
    return appLogsRef.doc().set(logObj.log());
}

app.get('/edit_rule/:token', async (request, response) => {
    try {
        const { uid } = await authenticator.checkGetAccess(request.params.token);

        const id = request.query.rule;
        const rule_ref = db.doc(`/users/${uid}/rules/${id}`);
        const rule_snapshot = await rule_ref.get();

        if (!rule_snapshot.exists) {
            await log(logger.getRuleRequestFailure(request, '/edit_rule', uid, ErrorCode.RULE.NOT_FOUND, admin.firestore.FieldValue.serverTimestamp()));
            response.status(404).send(fs.readFileSync(path.resolve(__dirname, '../404.html')));
        } else {
            const rule = rule_snapshot.data() as RuleInput;

            fs.readFile(path.resolve(__dirname, '../edit_rule.html'), 'utf8', async (error, data) => {
                if (error) {
                    await log(logger.getRuleRequestFailure(request, '/edit_rule', uid, 'HTML Page Not Found Corresponding to URL Not Found', admin.firestore.FieldValue.serverTimestamp()));
                    response.status(404).send(fs.readFileSync(path.resolve(__dirname, '../404.html')));
                } else {
                    const html = data;
    
                    const id_filled = html.replace('::ID::', rule_snapshot.id);
                    const name_filled = id_filled.replace('::NAME::', rule.name);
                    const priority_filled = name_filled.replace('::PRIORITY::', rule.priority.toString());
                    const sip_filled = priority_filled.replace('::SIP::', rule.sourceip);
                    const sport_filled = sip_filled.replace('::SPORT::', rule.sourceport);
                    const dip_filled = sport_filled.replace('::DIP::', rule.destip);
                    const dport_filled = dip_filled.replace('::DPORT::', rule.destport);
    
                    const access = rule.access ? ' checked' : '';
                    const access_filled = dport_filled.replace('::ACCESS::', access)
                    
                    let protocol_filled = '';
                    if (rule.protocol.toLowerCase() === 'tcp') {
                        const removedUdp = access_filled.replace('::PROTOCOL_UDP::', '');
                        protocol_filled = removedUdp.replace('::PROTOCOL_TCP::', ' checked');
                    } else {
                        const removedUdp = access_filled.replace('::PROTOCOL_TCP::', '');
                        protocol_filled = removedUdp.replace('::PROTOCOL_UDP::', ' checked');
                    }
                    
                    const direction = rule.direction ? ' checked' : '';
                    const edit_rule = protocol_filled.replace('::DIRECTION::', direction);
    
                    await log(logger.getRuleRequestSuccess(request, '/edit_rule', uid, admin.firestore.FieldValue.serverTimestamp()));
                    response.send(edit_rule);
                }
            });
        }
    } catch (error) {
        await log(logger.getRuleRequestFailure(request, '/edit_rule', null, error, admin.firestore.FieldValue.serverTimestamp()));
        console.error(`Error while serving GET request for /edit_rule: ${error}`);
        response.status(404).send(fs.readFileSync(path.resolve(__dirname, '../404.html')));
    }
});

app.get('/delete_rule/:token', async (request, response) => {
    try {
        const { uid } = await authenticator.checkGetAccess(request.params.token);

        const id = request.query.rule;
        const rule_ref = db.doc(`/users/${uid}/rules/${id}`);
        const rule_snapshot = await rule_ref.get();

        if (!rule_snapshot.exists) {
            await log(logger.getRuleRequestFailure(request, '/delete_rule', uid, ErrorCode.RULE.NOT_FOUND, admin.firestore.FieldValue.serverTimestamp()));
            response.status(404).send(fs.readFileSync(path.resolve(__dirname, '../404.html')));
        } else {
            const { name } = rule_snapshot.data() as RuleInput;
    
            fs.readFile(path.resolve(__dirname, '../delete_rule.html'), 'utf8', async (error, data) => {
                if (error) {
                    await log(logger.getRuleRequestFailure(request, '/delete_rule', uid, 'HTML Page Not Found Corresponding to URL Not Found', admin.firestore.FieldValue.serverTimestamp()));
                    response.status(404).send(fs.readFileSync(path.resolve(__dirname, '../404.html')));
                } else {
                    const html = data;
    
                    const id_filled = html.replace('::ID::', rule_snapshot.id);
                    const name_filled = id_filled.replace('::NAME::', name);
                    
                    await log(logger.getRuleRequestSuccess(request, '/delete_rule', uid, admin.firestore.FieldValue.serverTimestamp()));
                    response.send(name_filled);
                }
            });
        }
    } catch (error) {
        await log(logger.getRuleRequestFailure(request, '/delete_rule', null, error, admin.firestore.FieldValue.serverTimestamp()));
        console.error(`Error while serving GET request for /delete_rule: ${error}`);
        response.status(404).send(fs.readFileSync(path.resolve(__dirname, '../404.html')));
    }
});

app.get('/account', async (request, response) => {
    try {
        const { mode, oobCode } = request.query;

        switch(mode) {
            case 'resetPassword':
                fs.readFile(path.resolve(__dirname, '../reset_pass.html'), 'utf8', async (err, data) => {
                    if (err) {
                        throw new Error('File not found');
                    } else {
                        const html = data;
                        const finalHtml = html.replace('::CODE::', oobCode);
                        await log(logger.emailHandlerSuccess('/account', admin.firestore.FieldValue.serverTimestamp()));
                        response.send(finalHtml);
                    }
                });
                break;
            case 'recoverEmail':
                fs.readFile(path.resolve(__dirname, '../recover_email.html'), 'utf8', async (err, data) => {
                    if (err) {
                        throw new Error('File not found');
                    } else {
                        const html = data;
                        const finalHtml = html.replace('::CODE::', oobCode);
                        await log(logger.emailHandlerSuccess('/account', admin.firestore.FieldValue.serverTimestamp()));
                        response.send(finalHtml);
                    }
                });
                break;
            case 'verifyEmail':
                fs.readFile(path.resolve(__dirname, '../verify_email.html'), 'utf8', async (err, data) => {
                    if (err) {
                        throw new Error('File not found');
                    } else {
                        const html = data;
                        const finalHtml = html.replace('::CODE::', oobCode);
                        await log(logger.emailHandlerSuccess('/account', admin.firestore.FieldValue.serverTimestamp()));
                        response.send(finalHtml);
                    }
                });
                break;
            default:
                throw new Error('Invalid mode received');
                break;
        }
    } catch (error) {
        await log(logger.emailHandlerFailure('/account', admin.firestore.FieldValue.serverTimestamp(), error));
        console.error(`Error while handling email action: ${error}`);
        response.send(fs.readFileSync(path.resolve(__dirname, '../404.html'), 'utf8'));
    }
});

/**
 * The following is a test app to test CORS
 */
// app.post('/cors-allowed', cors, (request, response, next) => {
//     const body = request.body;
//     const email = body.email;
//     const password = body.password;

//     response.status(200).send(`Received Post Data: Your email is ${email}. Your password is ${password}. This was possible via Cross Origin Resource Sharing, also known as CORS for short.`);
// });

app.post('/rule-create', async (request, response) => {
    try {
        const { uid } = await authenticator.checkPostAccess(request.get(TOKEN));
        const {name, access, priority, proto, sip, sport, dip, dport, direction}
            = request.body;
        
        const input = iv.isValidRule(name, access, priority, proto, sip, sport, dip, dport, direction);

        if (!input) {
            await log(logger.ruleCreateFailure(request, uid, ErrorCode.RULE.BAD_DATA, admin.firestore.FieldValue.serverTimestamp(), input));
            response.send(ErrorCode.RULE.BAD_DATA);
        } else {
            // Check whether user has already created 
            // a similar rule
            const ruleWithSameName = await db.collection(`/users/${uid}/rules`)
                .where('name', '==', input.name)
            .get();
            
            if (!ruleWithSameName.empty) {
                await log(logger.ruleCreateFailure(request, uid, ErrorCode.RULE.ALREADY_EXIST, admin.firestore.FieldValue.serverTimestamp(), input));
                response.send(ErrorCode.RULE.ALREADY_EXIST);
            } else {
                const ruleRef = db.collection(`/users/${uid}/rules`).doc();
                const writeResult = await ruleRef.set({
                    name: input.name,
                    access: input.access,
                    priority: input.priority,
                    protocol: input.protocol,
                    sourceip: input.sourceip,
                    sourceport: input.sourceport,
                    destip: input.destip,
                    destport: input.destport,
                    state: input.state,
                    direction: input.direction,
                    created: admin.firestore.FieldValue.serverTimestamp()
                });
                await log(logger.ruleCreateSuccess(request, uid, writeResult.writeTime, input));
                response.send(SuccessCode.RULE.CREATE);
            }
        }
    } catch (error) {
        await log(logger.ruleCreateFailure(request, null, error, admin.firestore.FieldValue.serverTimestamp(), null));
        console.error(`Error while creating firewall rule: ${error}`);
        response.send(ErrorCode.RULE.CREATE);
    }
});

app.post('/rule-update', async (request, response) => {
    try {
        const { uid } = await authenticator.checkPostAccess(request.get(TOKEN));
        const {name, access, priority, proto, sip, sport, dip, dport, direction, id}
            = request.body;

        const input = iv.isValidRule(name, access, priority, proto, sip, sport, dip, dport, direction);
    
        if (!input) {
            await log(logger.ruleUpdateFailure(request, uid, ErrorCode.RULE.BAD_DATA, admin.firestore.FieldValue.serverTimestamp(), input));
            response.send(ErrorCode.RULE.BAD_DATA);
        } else {
            const ruleRef = db.doc(`/users/${uid}/rules/${id}`);
            const [ rule, ruleWithSameName ] = await Promise.all([
                ruleRef.get(), 
                db.collection(`/users/${uid}/rules`)
                    .where('name', '==', input.name)
                .get()
            ]);

            if (!rule.exists) {
                await log(logger.ruleUpdateFailure(request, uid, ErrorCode.RULE.NOT_FOUND, admin.firestore.FieldValue.serverTimestamp(), input));
                response.send(ErrorCode.RULE.NOT_FOUND);
            } else if (rule.data().name !== input.name && !ruleWithSameName.empty) {
                await log(logger.ruleCreateFailure(request, uid, ErrorCode.RULE.ALREADY_EXIST, admin.firestore.FieldValue.serverTimestamp(), input));
                response.send(ErrorCode.RULE.ALREADY_EXIST);
            } else {
                const writeResult = await ruleRef.set({
                    name: input.name,
                    access: input.access,
                    priority: input.priority,
                    protocol: input.protocol,
                    sourceip: sip,
                    sourceport: input.sourceport,
                    destip: input.destip,
                    destport: input.destport,
                    state: input.state,
                    direction: input.direction,
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                await log(logger.ruleUpdateSuccess(request, uid, writeResult.writeTime, input));
                response.send(SuccessCode.RULE.UPDATE);
            }
        }
    } catch (error) {
        await log(logger.ruleUpdateFailure(request, null, error, admin.firestore.FieldValue.serverTimestamp(), null));
        console.error(`Error while updating firewall rule: ${error}`);
        response.send(ErrorCode.RULE.UPDATE);
    }
});

app.post('/rule-delete', async (request, response) => {
    try {
        const { uid } = await authenticator.checkPostAccess(request.get(TOKEN));
        const { id } = request.body;

        const ruleRef = db.doc(`/users/${uid}/rules/${id}`);
        const rule = await ruleRef.get();

        if (!rule.exists) {
            await log(logger.ruleDeleteFailure(request, uid, ErrorCode.RULE.NOT_FOUND, admin.firestore.FieldValue.serverTimestamp(), {id}));
            response.send(ErrorCode.RULE.NOT_FOUND);
        } else {
            const writeResult = await ruleRef.delete();
            await log(logger.ruleDeleteSuccess(request, uid, writeResult.writeTime, {id}));
            response.send(SuccessCode.RULE.DELETE);
        }
    } catch (error) {
        await log(logger.ruleDeleteFailure(request, null, error, admin.firestore.FieldValue.serverTimestamp(), null));
        console.error(`Error while deleting rule: ${error}`);
        response.send(ErrorCode.RULE.DELETE);
    }
});

app.post('/global-update', async (request, response) => {
    try {
        const { uid } = await authenticator.checkPostAccess(request.get(TOKEN));
        const {
            // dpi,
            virusScan,
            blockAds, 
            blockMalicious,
            childSafety
        } = request.body
    
        const input = iv.isValidOptions(childSafety, virusScan, blockAds, blockMalicious)

        if (!input) {
            await log(logger.globalOptionsUpdateFailure(request, uid, ErrorCode.GLOBAL_OPTIONS.BAD_DATA, admin.firestore.FieldValue.serverTimestamp(), input));
            response.send(ErrorCode.GLOBAL_OPTIONS.BAD_DATA);
        } else {
            const writeResult = await db.doc(`/users/${uid}/options/global`).set({
                childSafety: input.childSafety,
                virusScan: input.virusScan,
                blockAds: input.blockAds, 
                blockMalicious: input.blockMalicious,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            await log(logger.globalOptionsUpdateSuccess(request, uid, writeResult.writeTime, input));
            response.send(SuccessCode.GLOBAL_OPTIONS.UPDATE);
        }
    } catch (error) {
        await log(logger.globalOptionsUpdateFailure(request, null, error, admin.firestore.FieldValue.serverTimestamp(), null));
        console.error(`Error while updating global options: ${error}`);
        response.send(ErrorCode.GLOBAL_OPTIONS.UPDATE);
    }
});

app.post('/filter-update', async (request, response) => {
    try {
        const { uid } = await authenticator.checkPostAccess(request.get(TOKEN));

        const { blacklist, whitelist, fakeNews, socialMedia, gambling, pornography } = request.body;

        const input = iv.isValidFilter(blacklist, whitelist, fakeNews, socialMedia, gambling, pornography);

        if (!input) {
            await log(logger.filterUpdateFailure(request, uid, ErrorCode.FILTER.BAD_DATA, admin.firestore.FieldValue.serverTimestamp(), input));
            response.send(ErrorCode.FILTER.BAD_DATA);
        } else {
            const writeResult = await db.doc(`/users/${uid}/filters/filter`)
            .set({
                whitelist: input.whitelist,
                blacklist: input.blacklist,
                fakeNews: input.fakeNews,
                socialMedia: input.socialMedia,
                gambling: input.gambling,
                pornography: input.pornography,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            await log(logger.filterUpdateSuccess(request, uid, writeResult.writeTime, input));
            response.send(SuccessCode.FILTER.UPDATE);
        }
    } catch (error) {
        await log(logger.filterUpdateFailure(request, null, error, admin.firestore.FieldValue.serverTimestamp(), null));
        console.error(`Error while updating filters: ${error}`);
        response.send(ErrorCode.FILTER.UPDATE);
    }
});

app.post('/logs', async (request, response) => {
    // TODO: If possible, perform authentication
    try {
        const { logs } = request.body;

        response.send(`Received the following: <br/>${logs}`);
    } catch (error) {
        console.error(`Error while reading logs from user: ${error}`);
        response.status(404).send(`Not Found`);
    }
});

app.all('*', (request, response) => {
    response.status(404).send(fs.readFileSync(path.resolve(__dirname, '../404.html'), 'utf8'));
});

export const web_app = functions.https.onRequest(app);

export const createNewUser = functions.auth.user().onCreate(async user => {
    const uid = user.uid;
    // const email = user.email;
    // const photoURL = user.photoURL;
    // const phoneNumber = user.phoneNumber;
    // const displayName = user.displayName;

    // The first two may have to be done 
    // on the client side. As for the python 
    // SDK, consider creating a node js client.
    // TODO: Set any other claims (account verified, etc)

    // auth.setCustomUserClaims(uid, {
    //     organisationVerified: false,
    //     accountVerified: false
    // });

    await log(logger.userCreate(uid, user.metadata.creationTime));

    return Promise.all([
        db.doc(`/users/${uid}/options/global`).set({
            // dpi: true,
            virusScan: true,
            blockAds: true, 
            blockMalicious: true,
            childSafety: true,
            created: admin.firestore.FieldValue.serverTimestamp()
        }),
        db.doc(`/users/${uid}/filters/filter`).set({
            // domains: [], 
            // mode: false
            whitelist: [],
            blacklist: [],
            fakeNews: true,
            socialMedia: true,
            gambling: true,
            pornography: true,
            created: admin.firestore.FieldValue.serverTimestamp()
        }),
        db.doc(`/users/${uid}`).set({
            created: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true }),
        auth.updateUser(uid, {
            displayName: user.email.substr(0, user.email.lastIndexOf('@'))
        })
    ]);
});

export const deleteUser = functions.auth.user().onDelete(async user => {
    const userDoc = db.doc(`/users/${user.uid}`);
    const userRuleDocs = await userDoc.collection('rules').get();
    const userFiltersDocs = await userDoc.collection('filters').doc('filter');
    const userOptionsDoc = userDoc.collection('options').doc('global');

    const deleteDocs = [];
    
    userRuleDocs.forEach(ruleDoc => {
        deleteDocs.push(ruleDoc.ref.delete());
    });

    deleteDocs.push(userFiltersDocs.delete());

    deleteDocs.push(userOptionsDoc.delete());

    deleteDocs.push(userDoc.delete());

    await log(logger.userDelete(user.uid, admin.firestore.FieldValue.serverTimestamp()));

    return Promise.all(deleteDocs);
});