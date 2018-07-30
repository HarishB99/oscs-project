const express = require('express');
const firebase = require('firebase');
const axios = require('axios');
const cors = require('cors')({ origin: true });
// const bodyParser = require('body-parser');
const config = {
    apiKey: "AIzaSyCUJp0rD0b9nNgA5pn4WOXtZr6mM4PxQp8",
    authDomain: "firegate-101.firebaseapp.com",
    databaseURL: "https://firegate-101.firebaseio.com",
    projectId: "firegate-101",
    storageBucket: "firegate-101.appspot.com",
    messagingSenderId: "700794827690"
};
firebase.initializeApp(config);

const app = express();
const db = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
db.settings(settings);

let rules_final = null;
let filter_final = null;

app.use(express.json());
app.use(cors);

function datestring() {
    return new Date().toString().split(" GMT")[0];
}
const dateString = new Date().toString();
console.log(`Timezone: ${dateString.substring(dateString.indexOf("GMT"))}`);

app.post('/login', (request, response) => {
    // TODO: Check if user has verified phone number
    // and email. If no, can do nothing. Else, can
    // do something.
    response.set('Accept', 'application/json');

    // For POST'
    console.log(request.body)
    const { email, password } = request.body;

    // For GET
    // const email = request.query.email;
    // const password = request.query.password;
    console.log(`${datestring()} [+] Logging in email: ${email}`);
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
        response.send('Login successful');
    }).catch(error => {
        console.error(`${datestring()} [-] Error while logging in: ${error}`);
        response.send('Login failure');
    });
});

firebase.auth().onAuthStateChanged(user => {
    console.log(`${datestring()} [+] Detected authentication state change`);
    if (user) {
        console.log(`${datestring()} [+] User logged in: ${user.displayName}`);
        const uid = user.uid;
        db.collection('users').doc(uid).collection('rules')
        .onSnapshot(rules => {
            console.log(`${datestring()} [+] Retrieving rules...`);
            const ruleJsons = [];
            rules.forEach(rule => {
                ruleJsons.push(rule.data());
            });
            rules_final = ruleJsons;
            console.log(`${datestring()} [+] Retrieved rules successfully`);
        });

        db.doc(`/users/${uid}/filters/filter`)
        .onSnapshot(filterDoc => {
            console.log(`${datestring()} [+] Retrieving filters...`);
            filter_final = filterDoc.data();
            console.log(`${datestring()} [+] Retrieved filters sucessfully`);
        });
    } else {
        console.log(`${datestring()} [-] No user logged in.`);
    }
});

app.get('/rules.json', (request, response) => {
    const responseJson = {
        rules: [],
        webfilter: {},
        dpi: true,
        virusScan: true,
        message: 'If the properties of this object are empty, you probably forgot to login first before performing this query.'
    };

    if (rules_final) {
        rules_final.forEach(rule => {
            responseJson.rules.push(rule);
        });
    }

    if (filter_final) {
        responseJson.webfilter = {
            mode: (filter_final.mode === 1 ? 'whitelist' : 'blacklist'),
            blockAds: filter_final.blockAds,
            blockMalicious: filter_final.blockMalicious,
            domainGroups: filter_final.domainGroups,
            domains: filter_final.domains
        };
    }

    response.json(responseJson);
});

// More functionalities will be added when deemed necessary

app.listen(3000);
