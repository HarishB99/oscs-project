import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import { InputValidator } from './InputValidator';
import { UserInput } from './UserInput';
import { UserClaim } from './UserClaim';
import { RuleInput } from './RuleInput';
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
        const { email, organisation, 
            phoneNumber, password } = request.body;

        let input: UserInput = null;
        if (iv.isValidEmail(email) && 
            iv.isValidOrgName(organisation) && 
            iv.isValidPhoneNum(phoneNumber) && 
            iv.isAReasonablyStrongPassword(password)) {
            input = new UserInput(email, password, 
                phoneNumber, organisation, null);
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
        response.send(JSON.stringify({
            displayName: displayName,
            status: 'ok'
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
        response.send(JSON.stringify({
            photoURL: photoURL,
            status: 'ok'
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
        const { displayName, email, phoneNumber, customClaims } 
            = await authenticator.checkAccess(request.get(TOKEN));
        const { organisation } = customClaims as UserClaim;
        response.send(JSON.stringify({
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
        const {name, access, priority, proto, sip, sport, dip, dport}
            = request.body;
        
        let input: RuleInput = null;
    
        if (iv.isValidRuleName(name) && iv.isBoolean(access)
            && iv.isNum(priority) && iv.isValidProto(proto)
            && iv.isValidIp(sip) && iv.isValidPortNum(sport)
            && iv.isValidIp(dip) && iv.isValidPortNum(dport)) {
            input = new RuleInput(name, access, priority, proto, sip, sport, dip, dport);
        }

        if (!input) {
            response.send(ErrorCode.RULE.BAD_DATA);
        } else {
            // Check whether user has already created 
            // a similar rule
            const ruleWithSameParameters = await db
                .collection('users').doc(uid)
                .collection('rules')
                .where('access', '==', input.access)
                .where('priority', '==', input.priority)
                .where('protocol', '==', input.proto.toUpperCase())
                .where('sourceip', '==', input.sip)
                .where('sourceport', '==', input.sport)
                .where('destip', '==', input.dip)
                .where('destport', '==', input.dport)
            .get();
            
            if (!ruleWithSameParameters.empty) {
                throw new Error(`Rule ${input.name} was already created`);
            } else {
                const ruleRef = db.collection('users')
                .doc(uid).collection('rules').doc();
                await ruleRef.set({
                    name: input.name,
                    access: input.access,
                    priority: input.priority,
                    protocol: input.proto.toUpperCase(),
                    sourceip: sip,
                    sourceport: input.sport,
                    destip: input.dip,
                    destport: input.dport,
                    state: input.state,
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
        const {name, access, priority, proto, sip, sport, dip, dport}
            = request.body;
        
        let input: RuleInput = null;
    
        if (iv.isValidRuleName(name) && iv.isBoolean(access)
            && iv.isNum(priority) && iv.isValidProto(proto)
            && iv.isValidIp(sip) && iv.isValidPortNum(sport)
            && iv.isValidIp(dip) && iv.isValidPortNum(dport)) {
            input = new RuleInput(name, access, priority, proto, sip, sport, dip, dport);
        }

        if (!input) {
            response.send(ErrorCode.RULE.BAD_DATA);
        } else {
            const ruleRef = db.collection('users')
            .doc(uid).collection('rules').doc();
            await ruleRef.set({
                name: input.name,
                access: input.access,
                priority: input.priority,
                protocol: input.proto,
                sourceip: sip,
                sourceport: input.sport,
                destip: input.dip,
                destport: input.dport,
                state: input.state,
                lastUpdate: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            response.send(SuccessCode.RULE.UPDATE);
        }
    } catch (error) {
        console.error(`Error while creating firewall rule: ${error}`);
        response.send(ErrorCode.RULE.UPDATE);
    }
});

app.post('/rule-delete', (request, response) => {
    response.status(503).send('Functionality not available yet.');
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

    return db.doc(`/users/${uid}`).set({
        created: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
});