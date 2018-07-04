import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import { InputValidator } from './InputValidator';
import { Input } from './Input';
import { UserClaim } from './UserClaim';
import { SuccessCode } from './SuccessCode';
import { ErrorCode } from './ErrorCode';
import * as cors from 'cors';

admin.initializeApp();

const app = express();
const db = admin.firestore();

/**
 * The following is a test app to test CORS
 */
const corsHandler = cors({ origin: true });
app.post('/cors-allowed', corsHandler, (request, response, next) => {
    const body = request.body;
    const email = body.email;
    const password = body.password;

    response.status(200).send(`Received Post Data: Your email is ${email}. Your password is ${password}. This was possible via Cross Origin Resource Sharing, also known as CORS for short.`);
});

/**
 * Function to retrieve the id token sent by client 
 * in the custom request header 'Authorisation'.
 * The value of the header is formatted as 'Bearer <token>'
 */
function getToken(header: string): string {
    if (header) {
        const match = header.match(/^Bearer\s+([^\s]+)$/)
        if (match) {
            return match[1]
        }
    }
    return null
}

// Accounts
app.post('/account', async (request, response) => {
    try {
        const { access, email } = request.body;
        if (access === 'login') {
            const { uid, emailVerified } = await admin.auth().getUserByEmail(email);
            const userDoc = await db.doc(`/users/${uid}`).get();
            if (emailVerified 
                && userDoc.data().phoneVerified) {
                response.send(JSON.stringify({
                    access: true
                }));
            } else {
                response.send(JSON.stringify({
                    access: false
                }));
            }
        } else {
            response.status(400).send('Bad request');
        }
    } catch (error) {
        console.error('Error while serving /account: ', error);
        response.send('Access denied');
    }
});

app.post('/account-create', async (request, response) => {
    try {
        // The following is possible because 
        // Content-Type on request header was 
        // set to application/json. This was 
        // done by axios itself.
        //
        // If the Content-Type flag was not 
        // sent, JSON.parse will have to be 
        // used on the body to extract the 
        // JSON.data
        const { email, organisation, phoneNumber, password } = request.body;

        let input: Input = null;
        const iv = new InputValidator();
        if (iv.isValidEmail(email) && iv.isValidOrgName(organisation) && 
            iv.isValidPhoneNum(phoneNumber) && iv.isAReasonablyStrongPassword(password)) {
            input = new Input(email, password, phoneNumber, organisation, null);
        }

        if (!input) {
            response.send(JSON.stringify(ErrorCode.ACCOUNT.BAD_DATA));
        } else {
            // TODO: Create user with password
            // Send verification email and verification SMS
            // using auth.user.onCreate method in admin SDK.
            // After verified, user can proceed to the 
            // system. Manage permissions with claims 
            // and uid from firebase client on client-side.

            const { uid } = await admin.auth().createUser({
                email: input.email,
                password: input.password,
                photoURL: input.photoURL,
                phoneNumber: input.phoneNumber,
                displayName: input.displayName
            });

            await admin.auth().setCustomUserClaims(uid, {
                organisation: input.organisation
            });

            response.send(JSON.stringify(SuccessCode.ACCOUNT.CREATE));
        }
    } catch (error) {
        console.error('Error while creating account request: ', error);
        response.send(JSON.stringify(ErrorCode.ACCOUNT.CREATE));
    }
});

app.post('/account-retrieve-name', async (request, response) => {
    // TODO: I might want to port over this implementation to 
    // the client side, unless python sdk also needs this.
    try {
        const idToken = getToken(request.get('Authorisation'));
        const { uid } = await admin.auth().verifyIdToken(idToken);
        const { displayName } = await admin.auth().getUser(uid);
        response.send(JSON.stringify({
            displayName: displayName,
            status: 'ok'
        }));
    } catch (error) {
        console.error('Error while retrieving profile: ', error);
        response.send(JSON.stringify({
            status: 'access denied'
        }));
    }
});

app.post('/account-retrieve-picture', async (request, response) => {
    // TODO: I might want to port over this implementation to 
    // the client side, unless python sdk also needs this.
    try {
        const idToken = getToken(request.get('Authorisation'));
        const { uid } = await admin.auth().verifyIdToken(idToken);
        const { photoURL } = await admin.auth().getUser(uid);
        response.send(JSON.stringify({
            photoURL: photoURL,
            status: 'ok'
        }));
    } catch (error) {
        console.error('Error while retrieving profile: ', error);
        response.send(JSON.stringify({
            status: 'access denied'
        }));
    }
});

app.post('/account-retrieve-basic', async (request, response) => {
    // TODO: I might want to port over this implementation to 
    // the client side, unless python sdk also needs this.
    try {
        const idToken = getToken(request.get('Authorisation'));
        const { uid } = await admin.auth().verifyIdToken(idToken);
        const { displayName, email, phoneNumber, customClaims } = await admin.auth().getUser(uid);
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
        response.send(JSON.stringify({
            status: 'access denied'
        }));
    }
});

app.post('/account-update', async (request, response) => {
    try {
        const idToken = getToken(request.get('Authorisation'));
        const { uid } = await admin.auth().verifyIdToken(idToken);

        const body = request.body;
        const email = body.email;
        const organisation = body.org;
        const phoneNumber = body.contact;

        let input: Input = null;
        const iv = new InputValidator();
        if (iv.isValidEmail(email) && iv.isValidOrgName(organisation) && 
            iv.isValidPhoneNum(phoneNumber)) {
            input = new Input(email, null, phoneNumber, organisation, null);
        }

        if (!input) {
            response.send('Bad Request');
        } else {
            // TODO: Send verification email and verification SMS
            // if email or phone number has been changed.

            await admin.auth().updateUser(uid, {
                email: input.email,
                phoneNumber: input.phoneNumber
            });

            await admin.auth().setCustomUserClaims(uid, {
                organisation: input.organisation
            });

            response.send('Account Update: Success');
        }
    } catch (error) {
        console.error('Error while updating account details: ', error);
        response.send('Access denied');
    }
});

app.post('/account-delete', (request, response) => {
    response.status(503).send('Functionality not available yet.');
});

app.post('/account-pass-update', (request, response) => {
    response.status(503).send('Functionality not available yet.');
});

app.post('/rule-create', (request, response) => {
    response.status(503).send('Functionality not available yet.');
});

app.post('/rule-update', (request, response) => {
    response.status(503).send('Functionality not available yet.');
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

    // admin.auth().setCustomUserClaims(uid, {
    //     organisationVerified: false,
    //     accountVerified: false
    // });

    return db.doc(`/users/${uid}`).set({
        phoneVerified: false
    }, { merge: true });
});