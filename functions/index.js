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
const incomingRulesRef = db.collection('incoming');
const outgoingRulesRef = db.collection('outgoing');
const rulesRef = db.collection('rules');
const webFilterRef = db.collection('filters').doc('filter');

const app = express();

function generateSalt() {
    return crypto.pseudoRandomBytes(64).toString('hex');
}

function hash(message, salt) {
    const digest = crypto.createHash('sha512');
    const finalMessage = message.concat(salt);
    digest.update(finalMessage);
    return digest.digest('hex');
}

function encrypt(plainText, password) {
    const cipher = crypto.createCipher('aes256', password);
    let cipherText = cipher.update(plainText, 'utf8', 'hex');
    cipherText += cipher.final('hex');
    return cipherText;
}

function decrypt(cipherText, password) {
    const decipher = crypto.createDecipher('aes256', password);
    let plainText = decipher.update(cipherText, 'hex', 'utf8');
    plainText += decipher.final('utf8');
    return plainText;
}

// app.get('/create-test-user', (request, response) => {
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
//     const input = {
//         email: "test@example.com",
//         phoneNumber: "87127475",
//         password: "secretTestPassword",
//         organisation: 'example.org'
//     };
    
//     admin.auth().createUser({
//         email: "test@example.com",
//         emailVerified: false,
//         phoneNumber: "+65".concat(input.phoneNumber),
//         password: input.password,
//         displayName: input.email.substr(0, input.email.lastIndexOf('@')),
//         photoURL: input.photoURL || "https://material.io/tools/icons/static/icons/baseline-perm_identity-24px.svg",
//         disabled: false
//     }).then(userRecord => {
//         return admin.auth().setCustomUserClaims(userRecord.uid, {
//             organisation: input.organisation
//         });
//         // return db.doc(`/users/${userRecord.uid}`).set({
//         //     organisation: 'example.org'
//         // });
//     }).then(() => {
//         response.send('User Creation Successful');
//     }).catch(error => {
//         console.log("Error while creating test user: ", error);
//         response.send('User Creation Unsuccessful');
//     });
// });

// app.get('/create-test-user2', (request, response) => {
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
//     const input = {
//         email: "test2@example.com",
//         phoneNumber: "87127479",
//         password: "toBeUnlocked@nypsit2018",
//         organisation: 'example.org'
//     };
//     const encryptedPassword = encrypt(input.password, 'secretWhispered1519');
//     const salt = generateSalt();
    
    
//     admin.auth().createUser({
//         email: input.email,
//         emailVerified: false,
//         phoneNumber: "+65".concat(input.phoneNumber),
//         displayName: input.email.substr(0, input.email.lastIndexOf('@')),
//         photoURL: input.photoURL || "https://material.io/tools/icons/static/icons/baseline-perm_identity-24px.svg",
//         disabled: false
//     }).then(userRecord => {
//         let promises = [];
//         promises.push(admin.auth().setCustomUserClaims(userRecord.uid, {
//             organisation: input.organisation
//         }));
//         promises.push(db.doc(`/users/${userRecord.uid}`).set({
//             secret: hash(encryptedPassword, salt),
//             salt: encrypt(salt, 'thisIs@V3ryImportantSt3p')
//         }));
//         // return db.doc(`/users/${userRecord.uid}`).set({
//         //     organisation: 'example.org'
//         // });
//         return Promise.all(promises);
//     }).then(() => {
//         response.send('User Creation Successful');
//     }).catch(error => {
//         console.log("Error while creating test user: ", error);
//         response.send('User Creation Unsuccessful');
//     });
// });

app.get('/profile-retrieve', (request, response) => {
    // TODO: authenticate user before 
    // retrieving profile
    const email = request.query.email;
    let responseJson = {};
    admin.auth().getUserByEmail(email)
    .then(userRecord => {
        responseJson.displayName = userRecord.displayName;
        responseJson.email = userRecord.email;
        responseJson.phoneNumber = userRecord.phoneNumber;
        responseJson.organisation = userRecord.customClaims.organisation;
        responseJson.status = 'ok';
        response.send(JSON.stringify(responseJson));
        // return db.doc(`/users/${userRecord.uid}`).get();
    })
    // .then(dbUserRecord => {
    //     responseJson.organisation = dbUserRecord.get('organisation');
    //     responseJson.status = 'ok';
    //     response.send(JSON.stringify(responseJson));
    // })
    .catch(error => {
        responseJson.status = 'access denied';
        console.error('', error);
        response.send(JSON.stringify(responseJson));
    });
});

app.get('/login', (request, response) => {
    // response.set('Access-Control-Allow-Origin', '*');
    // response.set('Access-Control-Allow-Methods', 'POST');
    const email = request.query.username;
    const pass = request.query.pass;

    firebaseApp.auth().signInWithEmailAndPassword(
        email, pass
    ).then(() => {
        return admin.auth().getUserByEmail(email);
    }).then(userRecord => {
        return db.doc(`/users/${userRecord.uid}`).set({
            state: 'loggedin'
        }, { merge: true });
    }).then(() => {
        response.send('Sign in successful');
    }).catch(error => {
        console.log("Error while signing in user: ", error);
        response.send("Access denied");
    });
});

app.get('/login2', (request, response) => {
    // response.set('Access-Control-Allow-Origin', '*');
    // response.set('Access-Control-Allow-Methods', 'POST');
    const email = request.query.username;
    const pass = request.query.pass;

    admin.auth().getUserByEmail(email).then(userRecord => {
        const uid = userRecord.uid;
        return db.doc(`/users/${uid}`).get();
    }).then(userSecret => {
        const secret = userSecret.data();
        const encryptedSalt = secret.salt;
        const hashedPass = secret.secret;
        const salt = decrypt(encryptedSalt, 'thisIs@V3ryImportantSt3p');
        const hashedReceivedPass = hash(encrypt(pass, 'secretWhispered1519'), salt);
        console.log("Hashed Pass: ", hashedPass);
        console.log("Hashed received pass: ", hashedReceivedPass);
        if (hashedReceivedPass === hashedPass) {
            response.send('You are authorised');
        } else {
            response.send('Access Denied');
        }
    }).catch(error => {
        console.error('Error while signing in user: ', error);
        response.send('Access Denied');
    });
});

app.get('/rules.json', (request, response) => {
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

    rulesRef.get().then(rules => {
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
                responseJson.firewallRules.incoming.push(responseRule);
            } else if (params.direction === "out") {
                responseJson.firewallRules.outgoing.push(responseRule);
            }
        });
        return webFilterRef.get();
    }).then(filterDoc => {
        const filter = filterDoc.data();
        const modes = ["blacklist", "whitelist"];
        responseJson.webfilter = {
            mode: modes[filter.mode],
            blockAds: filter.blockAds,
            blockMalicious: filter.blockMalicious,
            domainGroups: filter.domainGroups,
            domains: filter.domains
        };
        response.json(responseJson);
    }).catch(error => {
        console.error('Error while retrieving rules from database', error);
        response.status(500).send('Internal Error');
    });
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