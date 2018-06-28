// const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase');
const express = require('express');
const crypto = require('crypto');
const cors = require('cors')({ origin: true });

const config = {
    apiKey: "AIzaSyCUJp0rD0b9nNgA5pn4WOXtZr6mM4PxQp8",
    authDomain: "firegate-101.firebaseapp.com",
    databaseURL: "https://firegate-101.firebaseio.com",
    projectId: "firegate-101",
    storageBucket: "firegate-101.appspot.com",
    messagingSenderId: "700794827690"
};

const firebaseApp = firebase.initializeApp(config);

admin.initializeApp();

const db = admin.firestore();
const rulesRef = db.collection('rules');
const webFilterRef = db.collection('filters').doc('filter');

const app = express();

class CryptoGrapher {
    generateSalt() {
        return crypto.pseudoRandomBytes(64).toString('hex');
    }

    hash(message, salt) {
        const digest = crypto.createHash('sha512');
        const finalMessage = message.concat(salt);
        digest.update(finalMessage);
        return digest.digest('hex');
    }

    encrypt(plainText, password) {
        const cipher = crypto.createCipher('aes256', password);
        let cipherText = cipher.update(plainText, 'utf8', 'hex');
        cipherText += cipher.final('hex');
        return cipherText;
    }

    decrypt(cipherText, password) {
        const decipher = crypto.createDecipher('aes256', password);
        let plainText = decipher.update(cipherText, 'hex', 'utf8');
        plainText += decipher.final('utf8');
        return plainText;
    }
}

class InputValidator {
    isEmpty(input) {
        return (input === "" || input === null || input === undefined) ? true : false;
    }

    isOfValidLength(input, min, max, inclusive) {
        return this.isInValidRange(input.length, min, max, inclusive);
    }

    isValidOrgName(input) {
        return /^[A-Za-z0-9 .,()]{3,30}$/.test(input);
    }

    // TODO: Rectify regex to check email
    isValidEmail(input) {
        const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(input);
    }

    isValidPhoneNum(input) {
        const regex = /^[89]+\d{7}$/;
        return regex.test(input);
    }

    isInValidRange(input, min, max, inclusive) {
        return inclusive ? (input >= min && input <= max) : (input > min && input < max);
    }
}

class Input {
    /**
     * To construct an Input object to process user input
     * @param {*} email email of user
     * @param {*} password password of user
     * @param {*} phoneNumber phoneNumber of user
     * @param {*} organisation organisation of user
     * @param {*} photoURL url of the display picture of the user
     * @author Harish S/O Balamurugan
     */
    constructor(email, password, phoneNumber, organisation, photoURL) {
        this.email = email;
        this.password = password;
        this.phoneNumber = '+65'.concat(phoneNumber);
        this.organisation = organisation;
        this.photoURL = photoURL || 'https://material.io/tools/icons/static/icons/baseline-perm_identity-24px.svg';
        this.displayName = this.email.substr(0, this.email.lastIndexOf('@'));
    }

    toString() {
        return JSON.stringify({
            email: this.email,
            password: this.password,
            phoneNumber: this.phoneNumber,
            organisation: this.organisation,
            photoURL: this.photoURL,
            displayName: this.displayName
        });
    }
}

/**
 * The following is a test app to test CORS
 */
// app.post('/cors-allowed', cors, (request, response, next) => {
//     const body = request.body;
//     console.log(body);
//     const email = body.username;
//     const password = body.password;

//     response.status(200).send(`Received Post Data: Your email is ${email}. Your password is ${password}. This was possible via Cross Origin Resource Sharing, also known as CORS for short.`);
// });

// app.get('/create-test-user', async (request, response) => {
//     // TODO: Generate password and send to users
//     // I believe this can be achieved using 
//     // Firebase sing-in with link.
//     // So I need to determine whether it is 
//     // the first time that a user is signing up and 
//     // if yes, send them an email containing their 
//     // password, whick will be used by client to sign in 
//     // and then update the new password that the 
//     // user will create via admin.auth().updateUser();
//     // Hopefully this works without any errors. 

//     // TODO: Get the input from user 
//     // Validate the inputDO 
//     const input = new Input('test@example.com', 'secretTestPassword', '87127475', 'example.org', null);

//     try {
//         const userRecord = await admin.auth().createUser({
//             email: input.email,
//             emailVerified: false,
//             phoneNumber: input.phoneNumber,
//             password: input.password,
//             displayName: input.displayName,
//             photoURL: input.photoURL,
//             disabled: false
//         });

//         await admin.auth().setCustomUserClaims(userRecord.uid, {
//             organisation: input.organisation
//         });

//         response.send('User Creation Successful');
//     } catch (error) {
//         console.log('Error while creating test user: ', error);
//         response.send('User Creation Unsuccessful');
//     }
// });

// app.get('/create-test-user2', async (request, response) => {
//     // TODO: Generate password and send to users
//     // I believe this can be achieved using 
//     // Firebase sing-in with link.
//     // So I need to determine whether it is 
//     // the first time that a user is signing up and 
//     // if yes, send them an email containing their 
//     // password, whick will be used by client to sign in 
//     // and then update the new password that the 
//     // user will create via admin.auth().updateUser();
//     // Hopefully this works without any errors. 

//     // TODO: Get the input from user 
//     // Validate the inputDO 
//     const input = new Input('test2@example.com', '87127479', 'toBeUnlocked@nypsit2018', 'example.org', null);

//     const cryptographer = new CryptoGrapher();
//     const encryptedPassword = cryptographer.encrypt(input.password, 'secretWhispered1519');
//     const salt = cryptographer.generateSalt();
    
//     try {
//         const userRecord = await admin.auth().createUser({
//             email: input.email,
//             emailVerified: false,
//             phoneNumber: input.phoneNumber,
//             displayName: input.displayName,
//             photoURL: input.photoURL,
//             disabled: false
//         });
//         // Await setting of user claim and db record
//         await Promise.all([
//             admin.auth().setCustomUserClaims(userRecord.uid, {
//                 organisation: input.organisation
//             }),
//             db.doc(`/users/${userRecord.uid}`).set({
//                 secret: cryptographer.hash(encryptedPassword, salt),
//                 salt: cryptographer.encrypt(salt, 'thisIs@V3ryImportantSt3p')
//             })
//         ]);
//         response.send('User Creation Successful');
//     } catch (error) {
//         console.log("Error while creating test user: ", error);
//         response.send('User Creation Unsuccessful');
//     }
// });

app.post('/account-create-request', async (request, response) => {
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
    
        let input = null;
        const iv = new InputValidator();
        if (iv.isValidEmail(email) && iv.isValidPhoneNum(phoneNumber) && iv.isValidOrgName(organisation)) {
            input = new Input(email, null, phoneNumber, organisation, null);
        }

        if (!input) {
            response.send('Bad Request');
        } else {
            // TODO: Create user without password and send OTP 
            // (After successfully signing up using OTP, user 
            // will have to create password)
            // An account verified claim should be used
            const requestRef = db.collection('requests').doc();
            await requestRef.set({
                email: input.email,
                organisation: input.organisation,
                phoneNumber: input.phoneNumber
            });
            response.send('Account Request: Created');
        }
    } catch (error) {
        console.error('Error while creating account request: ', error);
        response.send('Access denied');
    }
});

app.get('/profile-retrieve', async (request, response) => {
    // TODO: authenticate user before 
    // retrieving profile
    // I might want to port over this implementation to 
    // the client side, unless python sdk also needs this.
    const email = request.query.email;
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        response.send(JSON.stringify({
            displayName: userRecord.displayName,
            email: userRecord.email,
            phoneNumber: userRecord.phoneNumber,
            organisation: userRecord.customClaims.organisation,
            status: 'ok'
        }));
    } catch (error) {
        console.error('Error while retrieving profile: ', error);
        response.send(JSON.stringify({
            status: 'access denied'
        }));
    }
});

app.post('/login', cors, async (request, response, next) => {
    const email = request.query.username;
    const pass = request.query.pass;

    try {
        await firebaseApp.auth().signInWithEmailAndPassword(email, pass);
        const userRecord = await admin.auth().getUserByEmail(email);
        await db.doc(`/users/${userRecord.uid}`).set({
            state: 'loggedin'
        }, { merge: true });
        response.send('Sign in successful');
    } catch (error) {
        console.error('Error while signing in user: ', error);
        response.send('Access denied');
    }
});

app.post('/login2', cors, async (request, response, next) => {
    const email = request.query.username;
    const pass = request.query.pass;

    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const keysDoc = await db.doc(`/users/${userRecord.uid}`).get();
        const keys = keysDoc.data();
        const salt = cryptographer.decrypt(keys.salt, 'thisIs@V3eryImportantSt3p');
        const hashedPass = keys.secret;
        const hashedReceivedPass = cryptographer.hash(cryptographer.encrypt(pass, 'secretWhispered1519'), salt);
        if (hashedReceivedPass === hashedPass) {
            response.send('ok');
        } else {
            response.send('Access Denied');
        }
    } catch (error) {
        console.error('Error while signing in user: ', error);
        response.send('Access Denied');
    }
});

app.get('/rules.json', async (request, response) => {
    // The following line sets the Cache Control such that 
    // the firewall rules can be cached to a CDN server (hence 
    // the option "public")
    //
    // max-age: store the cache in the browser for 300s
    // s-max-age: store the cache in the CDN for 600s
    // response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    // const incomingRules = incomingRulesRef.get();
    // const outgoingRules = outgoingRulesRef.get();
    // const webfilter = await webFilterRef.get()
    // response.set('Access-Control-Allow-Origin', '*');
    // response.set('Access-Control-Allow-Methods', 'POST');
    const responseJson = {
        firewallRules: {
            incoming: [],
            outgoing: []
        },
        webfilter: {},
        dpi: true,
        virusScan: true
    };

    try {
        const rules = await rulesRef.get();
        rules.forEach(rule => {
            const params = rule.data();
            const responseRule = {
                priority: params.priority,
                name: params.name,
                allow: params.allow,
                sourceip: params.sourceip,
                sourceport: params.sourceport,
                destip: params.destip,
                destport: params.destport,
                protocol: params.protocol,
                state: params.state
            };
    
            if (params.direction === "in") {
                responseJson.firewallRules
                    .incoming.push(responseRule);
            } else if (params.direction === "out") {
                responseJson.firewallRules
                    .outgoing.push(responseRule);
            }
        });
        const filterDoc = await webFilterRef.get();
        const filter = filterDoc.data();
        responseJson.webfilter = {
            mode: (filter.mode === 1 ? 'whitelist' : 'blacklist'),
            blockAds: filter.blockAds,
            blockMalicious: filter.blockMalicious,
            domainGroups: filter.domainGroups,
            domains: filter.domains
        };
        response.json(responseJson);
    } catch (error) {
        console.error('Error while retrieving rules from database', error);
        response.send('Internal Error');
    }
});

exports.web_app = functions.https.onRequest(app);

exports.createNewUser = functions.auth.user().onCreate(user => {
    const uid = user.uid;
    // const email = user.email;
    // const photoURL = user.photoURL;
    // const phoneNumber = user.phoneNumber;
    // const displayName = user.displayName;

    return db.doc(`/users/${uid}`).set({
        state: 'approved'
    }, { merge: true }); // , { merge: true }
});