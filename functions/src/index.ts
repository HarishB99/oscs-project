import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import { InputValidator } from './InputValidator';
import { Input } from './Input';
import { UserClaim } from './UserClaim';
// import * as cors from 'cors';

admin.initializeApp();

const app = express();
const db = admin.firestore();

/**
 * The following is a test app to test CORS
 */
// const corsHandler = cors({ origin: true });
// app.post('/cors-allowed', corsHandler, (request, response, next) => {
//     const body = request.body;
//     const email = body.email;
//     const password = body.password;

//     response.status(200).send(`Received Post Data: Your email is ${email}. Your password is ${password}. This was possible via Cross Origin Resource Sharing, also known as CORS for short.`);
// });

// Accounts
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
        const body = request.body;
        const email = body.email;
        const organisation = body.org;
        const phoneNumber = body.contact;
        const password = body.pass;

        let input: Input = null;
        const iv = new InputValidator();
        if (iv.isValidEmail(email) && iv.isValidOrgName(organisation) && 
            iv.isValidPhoneNum(phoneNumber) && iv.isAReasonablyStrongPassword(password)) {
            input = new Input(email, password, phoneNumber, organisation, null);
        }

        if (!input) {
            response.send('Bad Request');
        } else {
            // TODO: Create user with password
            // Send verification email and verification SMS
            // using auth.user.onCreate method in admin SDK.
            // After verified, user can proceed to the 
            // system. Manage permissions with claims 
            // and uid from firebase client on client-side.

            const userRecord = await admin.auth().createUser({
                email: input.email,
                password: input.password,
                photoURL: input.photoURL,
                phoneNumber: input.phoneNumber,
                displayName: input.displayName
            });

            await admin.auth().setCustomUserClaims(userRecord.uid, {
                organisation: input.organisation
            });

            response.send('Account Request: Created');
        }
    } catch (error) {
        console.error('Error while creating account request', error);
        response.send('Access denied');
    }
});

app.get('/account-retrieve', async (request, response) => {
    // TODO: authenticate user before 
    // retrieving profile
    // I might want to port over this implementation to 
    // the client side, unless python sdk also needs this.
    try {
        const uid = request.query.uid;

        const userRecord = await admin.auth().getUser(uid);
        const userClaims: UserClaim = userRecord.customClaims as UserClaim;
        response.send(JSON.stringify({
            displayName: userRecord.displayName,
            email: userRecord.email,
            phoneNumber: userRecord.phoneNumber,
            organisation: userClaims.organisation,
            photoURL: userRecord.photoURL,
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
        // TODO: authenticate user before 
        // updating profile
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
            // TODO: Create user with password
            // Send verification email and verification SMS
            // if email or phone number has been changed.

            const userRecord = await admin.auth().getUserByEmail(input.email);
            await admin.auth().updateUser(userRecord.uid, {
                email: input.email,
                phoneNumber: input.phoneNumber
            });

            await admin.auth().setCustomUserClaims(userRecord.uid, {
                organisation: input.organisation
            });

            response.send('Account Update: Success');
        }
    } catch (error) {
        console.error('Error while updating account details', error);
        response.send('Access denied');
    }
});

app.post('/account-delete', (request, response) => {
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

    return db.doc(`/user/${uid}`).set({
        state: 'loggedout'
    }, { merge: true });
});