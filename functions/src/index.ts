import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import { InputValidator } from './InputValidator';
import { UserInput } from './UserInput';
import { UserClaim } from './UserClaim';
import { GlobalOptionsInput } from './GlobalOptionsInput';
import { SuccessCode } from './SuccessCode';
import { ErrorCode } from './ErrorCode';
import { Authenticator } from './Authenticator';
// import { h, render } from 'preact';
const cors = require('cors')({ origin: true });

admin.initializeApp();

const app = express();
const db = admin.firestore();
const auth = admin.auth();
const iv = new InputValidator();
const authenticator = new Authenticator();

const TOKEN = Authenticator.TOKEN_HEADER;

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
app.post('/account', async (request, response) => {
    try {
        const { access, email } = request.body;
        if (access === 'login' && 
        iv.isValidEmail(email)) {
            await authenticator
                .checkAccess(request.get(TOKEN));
            response.send(SuccessCode.ACCOUNT.ACCESS);
        } else {
            response.send(ErrorCode.ACCOUNT.BAD_DATA);
        }
    } catch (error) {
        console.error('Error while serving /account: ', error);
        response.send(ErrorCode.ACCOUNT.ACCESS);
    }
});

app.post('/account-create', async (request, response) => {
    try {
        const { email, org, 
            contact, pass } = request.body;

        let input: UserInput = null;
        if (iv.isValidEmail(email) && 
            iv.isValidOrgName(org) && 
            iv.isValidPhoneNum(contact) && 
            iv.isAReasonablyStrongPassword(pass)) {
            input = new UserInput(email, pass, 
                contact, org, null);
        }

        if (!input) {
            response.send(ErrorCode.ACCOUNT.BAD_DATA);
        } else {
            // TODO: Create user with password
            // Send verification email and verification SMS
            // using auth.user.onCreate method in admin SDK.
            // After verified, user can proceed to the 
            // system. Manage permissions with claims 
            // and uid from firebase client on client-side.

            const { uid } = await auth.createUser({
                email: input.email,
                password: input.password,
                photoURL: input.photoURL,
                phoneNumber: input.phoneNumber,
                displayName: input.displayName
            });

            await auth.setCustomUserClaims(uid, {
                organisation: input.organisation,
                phoneVerified: false
            });

            response.send(SuccessCode.ACCOUNT.CREATE);
        }
    } catch (error) {
        console.error('Error while creating account request: ', error);
        response.send(ErrorCode.ACCOUNT.CREATE);
    }
});

app.post('/account-retrieve-name', async (request, response) => {
    // TODO: I might want to port over this implementation to 
    // the client side, unless python sdk also needs this.
    try {
        const { displayName } = await authenticator.checkAccess(request.get(TOKEN));
        response.send(Object.assign(SuccessCode.ACCOUNT.ACCESS, {
            displayName: displayName
        }));
    } catch (error) {
        console.error('Error while retrieving profile: ', error);
        response.send(ErrorCode.ACCOUNT.ACCESS);
    }
});

app.post('/account-retrieve-picture', async (request, response) => {
    // TODO: I might want to port over this implementation to 
    // the client side, unless python sdk also needs this.
    try {
        const { photoURL } = await authenticator.checkAccess(request.get(TOKEN));
        response.send(Object.assign(SuccessCode.ACCOUNT.ACCESS, {
            photoURL: photoURL
        }));
    } catch (error) {
        console.error('Error while retrieving profile: ', error);
        response.send(ErrorCode.ACCOUNT.ACCESS);
    }
});

app.post('/account-retrieve-basic', async (request, response) => {
    // TODO: I might want to port over this implementation to 
    // the client side, unless python sdk also needs this.
    try {
        const {displayName, email, phoneNumber, customClaims} 
            = await authenticator.checkAccess(request.get(TOKEN));
        const { organisation } = customClaims as UserClaim;
        response.send(Object.assign(SuccessCode.ACCOUNT.ACCESS, {
            displayName: displayName,
            email: email,
            phoneNumber: phoneNumber.split("+65")[1],
            organisation: organisation,
            status: 'ok'
        }));
    } catch (error) {
        console.error('Error while retrieving profile: ', error);
        response.send(ErrorCode.ACCOUNT.ACCESS);
    }
});

app.post('/account-update', async (request, response) => {
    try {
        const { email, phoneNumber, uid } = await authenticator.checkAccess(request.get(TOKEN));

        const body = request.body;

        let input: UserInput = null;
        if (iv.isValidEmail(body.email) && 
        iv.isValidPhoneNum(body.contact)) {
            input = new UserInput(body.email, null, 
                body.contact, null, null);
        }

        if (!input) {
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

            await auth.updateUser(uid, {
                email: input.email,
                phoneNumber: input.phoneNumber
            });

            await auth.setCustomUserClaims(uid, {
                phoneVerified: phoneVerified
            });

            await db.doc(`/users/${uid}`).set({
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            response.send(SuccessCode.ACCOUNT.UPDATE);
        }
    } catch (error) {
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
        const { uid } = await authenticator.checkAccess(request.get(TOKEN));
        const {name, access, priority, proto, sip, sport, dip, dport, direction}
            = request.body;
        
        const input = iv.isValidRule(name, access, priority, proto, sip, sport, dip, dport, direction);

        if (!input) {
            response.send(ErrorCode.RULE.BAD_DATA);
        } else {
            // Check whether user has already created 
            // a similar rule
            const ruleWithSameParameters = await db
                .collection('users').doc(uid)
                .collection('rules')
                .where('name', '==', input.name)
                .where('access', '==', input.access)
                .where('priority', '==', input.priority)
                .where('protocol', '==', input.protocol)
                .where('sourceip', '==', input.sourceip)
                .where('sourceport', '==', input.sourceport)
                .where('destip', '==', input.destip)
                .where('destport', '==', input.destport)
                .where('direction', '==', input.direction)
            .get();
            
            if (!ruleWithSameParameters.empty) {
                // throw new Error(`Rule ${input.name} was already created`);
                response.send(ErrorCode.RULE.ALREADY_EXIST);
            } else {
                const ruleRef = db.collection('users')
                .doc(uid).collection('rules').doc();
                await ruleRef.set({
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
        console.error(`Error while creating firewall rule: ${error}`);
        response.send(ErrorCode.RULE.CREATE);
    }
});

app.post('/rule-update', async (request, response) => {
    try {
        const { uid } = await authenticator.checkAccess(request.get(TOKEN));
        const {name, access, priority, proto, sip, sport, dip, dport, direction}
            = request.body;
        
        const input = iv.isValidRule(name, access, priority, proto, sip, sport, dip, dport, direction);
    
        if (!input) {
            response.send(ErrorCode.RULE.BAD_DATA);
        } else {
            const ruleRef = db.collection('users')
            .doc(uid).collection('rules').doc();
            await ruleRef.set({
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
    } catch (error) {
        console.error(`Error while updating firewall rule: ${error}`);
        response.send(ErrorCode.RULE.UPDATE);
    }
});

app.post('/rule-delete', async (request, response) => {
    try {
        const { uid } = await authenticator.checkAccess(request.get(TOKEN));
        const {name, access, priority, proto, sip, sport, dip, dport, direction}
            = request.body;
        
        const input = iv.isValidRule(name, access, priority, proto, sip, sport, dip, dport, direction);

        const ruleToDelete = await db
                .collection('users').doc(uid)
                .collection('rules')
                .where('name', '==', input.name)
                .where('access', '==', input.access)
                .where('priority', '==', input.priority)
                .where('protocol', '==', input.protocol)
                .where('sourceip', '==', input.sourceip)
                .where('sourceport', '==', input.sourceport)
                .where('destip', '==', input.destip)
                .where('destport', '==', input.destport)
                .where('direction', '==', input.direction)
            .get();
        
        if (ruleToDelete.empty) {
            response.send(ErrorCode.RULE.NOT_FOUND);
        } else if (ruleToDelete.docs.length !== 1) {
            throw new Error(`There exists more that one rule with the same name in the database: ${input.toString()}`);
        } else {
            // TODO: Log the deletion of rule
            const writeResult = await db.doc(`/users/${uid}/rules/${ruleToDelete.docs[0].id}`).delete();
            response.send(SuccessCode.RULE.DELETE);
        }
    } catch (error) {
        console.log(`Error while deleting rule: ${error}`);
        response.send(ErrorCode.RULE.DELETE);
    }
});

app.post('/global-update', async (request, response) => {
    try {
        const { uid } = await authenticator.checkAccess(request.get(TOKEN));
        const {
            dpi,
            virusScan,
            blockAds, 
            blockMalicious
        } = request.body
    
        let input: GlobalOptionsInput = null;
    
        console.log(`dpi: ${dpi}, virusScan: ${virusScan}, blockAds: ${blockAds}, blockMalicious: ${blockMalicious}`);

        if (iv.isBoolean(dpi) && iv.isBoolean(virusScan)
            && iv.isBoolean(blockAds) && iv.isBoolean(blockMalicious)) {
            input = new GlobalOptionsInput(dpi, virusScan, blockAds, blockMalicious);
        }

        console.log(`Options parsed: ${input.toString()}`);

        if (!input) {
            response.send(ErrorCode.GLOBAL_OPTIONS.BAD_DATA);
        } else {
            await db.doc(`/users/${uid}/options/global`).set({
                dpi: input.dpi,
                virusScan: input.virusScan,
                blockAds: input.blockAds, 
                blockMalicious: input.blockMalicious,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            response.send(SuccessCode.GLOBAL_OPTIONS.UPDATE);
        }
    } catch (error) {
        console.error(`Error while updating global options: ${error}`);
        response.send(ErrorCode.GLOBAL_OPTIONS.UPDATE);
    }
});

app.post('/filter-create', (request, response) => {
    response.status(503).send('Functionality not available yet.');
});

app.post('/filter-update', (request, response) => {
    response.status(503).send('Functionality not available yet.');
});

app.post('/filter-delete', (request, response) => {
    response.status(503).send('Functionality not available yet.');
});

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
    // TODO: Send verification email
    // TODO: Send verification SMS
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