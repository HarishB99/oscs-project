import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import { InputValidator } from './InputValidator';
import { Authenticator } from './Authenticator';
import { UserInput } from './UserInput';
import { SuccessCode } from './SuccessCode';
import { ErrorCode } from './ErrorCode';
import * as fs from 'fs';
import * as path from 'path';
import { RuleInput } from './RuleInput';
// import { h, render } from 'preact';
const cors = require('cors')({ origin: true });

admin.initializeApp();

const app = express();
const db = admin.firestore();
db.settings({
    timestampsInSnapshots: true
});
const auth = admin.auth();
const iv = new InputValidator();
const authenticator = new Authenticator();

const TOKEN = Authenticator.TOKEN_HEADER;

app.get('/edit_rule/:token', async (request, response) => {
    try {
        const { uid } = await authenticator.checkGetAccess(request.params.token);

        const id = request.query.rule;
        const rule_ref = db.doc(`/users/${uid}/rules/${id}`);
        const rule_snapshot = await rule_ref.get();

        if (!rule_snapshot.exists) {
            // TODO: Log the failure of edit_rule GET request
            response.status(404).send(fs.readFileSync(path.resolve(__dirname, '../404.html')));
        } else {
            const rule = rule_snapshot.data() as RuleInput;

            fs.readFile(path.resolve(__dirname, '../edit_rule.html'), 'utf8', (error, data) => {
                if (error) {
                    // TODO: Log the failure of edit_rule GET request
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
    
                    // response.set('Content-Type', 'text/html');
                    // TODO: Log the success of edit_rule GET request
                    response.send(edit_rule);
                }
            });
        }
    } catch (error) {
        // TODO: Log the failure of edit_rule GET request
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
            // TODO: Log the failure of delete_rule GET request
            response.status(404).send(fs.readFileSync(path.resolve(__dirname, '../404.html')));
        } else {
            const { name } = rule_snapshot.data() as RuleInput;
    
            fs.readFile(path.resolve(__dirname, '../delete_rule.html'), 'utf8', (error, data) => {
                if (error) {
                    // TODO: Log the failure of delete_rule GET request
                    response.status(404).send(fs.readFileSync(path.resolve(__dirname, '../404.html')));
                } else {
                    const html = data;
    
                    const id_filled = html.replace('::ID::', rule_snapshot.id);
                    const name_filled = id_filled.replace('::NAME::', name);
                    
                    // TODO: Log the failure of delete_rule GET request
                    response.send(name_filled);
                }
            });
        }
    } catch (error) {
        // TODO: Log the failure of delete_rule GET request
        console.error(`Error while serving GET request for /delete_rule: ${error}`);
        response.status(404).send(fs.readFileSync(path.resolve(__dirname, '../404.html')));
    }
});

/**
 * The following is a test app to test CORS
 */
app.post('/cors-allowed', cors, (request, response, next) => {
    const body = request.body;
    const email = body.email;
    const password = body.password;

    response.status(200).send(`Received Post Data: Your email is ${email}. Your password is ${password}. This was possible via Cross Origin Resource Sharing, also known as CORS for short.`);
});

// Accounts
// app.post('/account', async (request, response) => {
//     try {
//         const { access, email } = request.body;
//         if (access === 'login' && 
//         iv.isValidEmail(email)) {
//             await authenticator
//                 .checkAccess(request.get(TOKEN));
//             response.send(SuccessCode.ACCOUNT.ACCESS);
//         } else {
//             response.send(ErrorCode.ACCOUNT.BAD_DATA);
//         }
//     } catch (error) {
//         console.error('Error while serving /account: ', error);
//         response.send(ErrorCode.ACCOUNT.ACCESS);
//     }
// });

app.post('/account-create', async (request, response) => {
    try {
        const { email, org, 
            contact, pass } = request.body;

        const input = iv.isValidUserDetails(email, pass, contact, org, null);

        if (!input) {
            // TODO: Log failure of account creation
            response.send(ErrorCode.ACCOUNT.BAD_DATA);
        } else {
            const { uid } = await auth.createUser({
                email: input.email,
                password: input.password,
                photoURL: input.photoURL,
                phoneNumber: input.phoneNumber,
                displayName: input.displayName
            });

            // TODO: Log account creation
            await auth.setCustomUserClaims(uid, {
                organisation: input.organisation,
                phoneVerified: false
            });

            response.send(SuccessCode.ACCOUNT.CREATE);
        }
    } catch (error) {
        // TODO: Log failure of account creation
        console.error('Error while creating account request: ', error);
        response.send(ErrorCode.ACCOUNT.CREATE);
    }
});

app.post('/account-update', async (request, response) => {
    try {
        const { email, phoneNumber, uid } = await authenticator.checkPostAccess(request.get(TOKEN));

        const body = request.body;

        let input: UserInput = null;
        if (iv.isValidEmail(body.email) && 
        iv.isValidPhoneNum(body.contact)) {
            input = new UserInput(body.email, null, 
                body.contact, null, null);
        }

        if (!input) {
            // TODO: Log failure of account update
            response.send(ErrorCode.ACCOUNT.BAD_DATA);
        } else {
            // TODO: Send verification email and verification SMS
            // if email or phone number has been changed.
            let emailVerified = false;
            let phoneVerified = false;

            // TODO: If emailverified is not changed after a change 
            // or emailverified is changed after every update, 
            // use the following value to update userRecord
            if (email === input.email)
                emailVerified = true;
            
            if (phoneNumber === input.phoneNumber) {
                phoneVerified = true;
            }

            // TODO: Log account update
            const [,,writeResult] = await Promise.all([
                auth.updateUser(uid, {
                    email: input.email,
                    phoneNumber: input.phoneNumber
                }),
                auth.setCustomUserClaims(uid, {
                    phoneVerified: phoneVerified
                }),
                db.doc(`/users/${uid}`).set({
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true })
            ]);

            response.send(SuccessCode.ACCOUNT.UPDATE);
        }
    } catch (error) {
        // TODO: Log failure of account update
        console.error('Error while updating account details: ', error);
        response.send(ErrorCode.ACCOUNT.UPDATE);
    }
});

app.post('/account-delete', (request, response) => {
    response.status(503).send('Functionality not available yet.');
});

app.post('/account-pass-update', (request, response) => {
    response.status(503).send('Functionality not available yet.');
});

app.post('/rule-create', async (request, response) => {
    try {
        const { uid } = await authenticator.checkPostAccess(request.get(TOKEN));
        const {name, access, priority, proto, sip, sport, dip, dport, direction}
            = request.body;
        
        const input = iv.isValidRule(name, access, priority, proto, sip, sport, dip, dport, direction);

        if (!input) {
            // TODO: Log failure of creation of rule
            response.send(ErrorCode.RULE.BAD_DATA);
        } else {
            // Check whether user has already created 
            // a similar rule
            const [ ruleWithSamePriority, ruleWithSameName ] = await Promise.all([
                db.collection(`/users/${uid}/rules`)
                    .where('priority', '==', input.priority)
                .get(), 
                db.collection(`/users/${uid}/rules`)
                    .where('name', '==', input.name)
                .get()
            ]);
            
            if (!ruleWithSameName.empty || !ruleWithSamePriority.empty) {
                // TODO: Log failure of creation of rule
                response.send(ErrorCode.RULE.ALREADY_EXIST);
            } else {
                // TODO: Log failure of creation of rule
                const ruleRef = db.collection(`/users/${uid}/rules`).doc();
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
                    created: admin.firestore.FieldValue.serverTimestamp()
                });
                response.send(SuccessCode.RULE.CREATE);
            }
        }
    } catch (error) {
        // TODO: Log failure of creation of rule
        console.error(`Error while creating firewall rule: ${error}`);
        response.send(ErrorCode.RULE.CREATE);
    }
});

app.post('/rule-update', async (request, response) => {
    try {
        const { uid } = await authenticator.checkPostAccess(request.get(TOKEN));
        const {name, access, priority, proto, sip, sport, dip, dport, direction, id}
            = request.body;

        console.log(`id received: ${id}`);
        
        const input = iv.isValidRule(name, access, priority, proto, sip, sport, dip, dport, direction);
    
        if (!input) {
            // TODO: Log failure of update of rule
            response.send(ErrorCode.RULE.BAD_DATA);
        } else {
            const ruleRef = db.doc(`/users/${uid}/rules/${id}`);
            const rule = await ruleRef.get();

            if (!rule.exists) {
                // TODO: Log failure of update of rule
                response.send(ErrorCode.RULE.NOT_FOUND);
            } else {
                // TODO: Log update of rule
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
                    lastUpdate: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                response.send(SuccessCode.RULE.UPDATE);
            }
        }
    } catch (error) {
        // TODO: Log failure of update of rule
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
            // TODO: Log failure of deletion of rule
            response.send(ErrorCode.RULE.NOT_FOUND);
        } else {
            // TODO: Log the deletion of rule
            const writeResult = await ruleRef.delete();
            response.send(SuccessCode.RULE.DELETE);
        }
    } catch (error) {
        // TODO: Log failure of deletion of rule
        console.log(`Error while deleting rule: ${error}`);
        response.send(ErrorCode.RULE.DELETE);
    }
});

app.post('/global-update', async (request, response) => {
    try {
        const { uid } = await authenticator.checkPostAccess(request.get(TOKEN));
        const {
            dpi,
            virusScan,
            blockAds, 
            blockMalicious
        } = request.body
    
        const input = iv.isValidOptions(dpi, virusScan, blockAds, blockMalicious)

        if (!input) {
            // TODO: Log failure of update of options
            response.send(ErrorCode.GLOBAL_OPTIONS.BAD_DATA);
        } else {
            // TODO: Log update of options
            const writeResult = await db.doc(`/users/${uid}/options/global`).set({
                dpi: input.dpi,
                virusScan: input.virusScan,
                blockAds: input.blockAds, 
                blockMalicious: input.blockMalicious,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            response.send(SuccessCode.GLOBAL_OPTIONS.UPDATE);
        }
    } catch (error) {
        // TODO: Log failure of update of options
        console.error(`Error while updating global options: ${error}`);
        response.send(ErrorCode.GLOBAL_OPTIONS.UPDATE);
    }
});

// app.post('/filter-add', (request, response) => {
    // response.status(503).send('Functionality not available yet.');
// });

app.post('/filter-update', async (request, response) => {
    try {
        const { uid } = await authenticator.checkPostAccess(request.get(TOKEN));

        const { filters, mode } = request.body;

        const input = iv.isValidFilter(filters, mode);

        if (!input) {
            response.send(ErrorCode.FILTER.BAD_DATA);
        } else {
            // TODO: Log the creation of filters
            const writeResult = await db.doc(`/users/${uid}/filters/filter`)
            .set({
                domains: input.domains,
                mode: input.mode
            }, { merge: true });
    
            response.send(SuccessCode.FILTER.UPDATE);
        }
    } catch (error) {
        console.error(`Error while updating filters: ${error}`);
        response.send(ErrorCode.FILTER.UPDATE);
    }
});

// app.post('/filter-delete', (request, response) => {
    // response.status(503).send('Functionality not available yet.');
// });

// app.all('*', (request, response) => {
//     response.status(404).send('Sorry, we can\'t find that ');
// });

export const web_app = functions.https.onRequest(app);

export const createNewUser = functions.auth.user().onCreate(user => {
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

    return Promise.all([
        db.doc(`/users/${uid}/options/global`).set({
            dpi: true,
            virusScan: true,
            blockAds: true, 
            blockMalicious: true,
            created: admin.firestore.FieldValue.serverTimestamp()
        }), 
        db.doc(`/users/${uid}`).set({
            created: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true })
    ]);
});

export const deleteUser = functions.auth.user().onDelete(async user => {
    const userDoc = db.doc(`/users/${user.uid}`);
    const userRuleDocs = await userDoc.collection('rules').get();
    const userFiltersDocs = await userDoc.collection('filter').get();
    const userOptionsDoc = userDoc.collection('options').doc('global');

    const deleteDocs = [];
    
    userRuleDocs.forEach(ruleDoc => {
        deleteDocs.push(ruleDoc.ref.delete());
    });

    userFiltersDocs.forEach(filterDoc => {
        deleteDocs.push(filterDoc.ref.delete());
    });

    deleteDocs.push(userOptionsDoc.delete());

    deleteDocs.push(userDoc.delete());

    return Promise.all(deleteDocs);
});