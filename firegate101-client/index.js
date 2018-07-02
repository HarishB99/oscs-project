const express = require('express');
const firebase = require('firebase');
const bodyParser = require('body-parser');
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

app.use(bodyParser.json());

app.post('/login', (request, response) => {
    // TODO: Authentication flow
    response.set('Accept', 'application/json');

    // For POST
    const body = request.body;
    const email = body.email;
    const password = body.password;

    // For GET
    // const email = request.query.email;
    // const password = request.query.password;
    
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
        response.send("Login successful");
    })
    .catch(error => {
        console.error("Error while loging in: ", error);
        response.send("Login failure");
    });
});

firebase.auth().onAuthStateChanged(user => {
    console.log('Status: Retrieving rules...');
    if (user) {
        const uid = user.uid;
        db.collection('users').doc(uid).collection('rules')
        .onSnapshot(rules => {
            const ruleJsons = [];
            rules.forEach(rule => {
                ruleJsons.push(rule.data());
            });
            rules_final = ruleJsons;
        });

        db.doc(`/users/${uid}/filters/filter`)
        .onSnapshot(filterDoc => {
            filter_final = filterDoc.data();
        });
        console.log('Retrieved rules successfully.');
    } else {
        console.log('No user logged in.');
    }
    console.log('Status: Finished retrieving rules.');
});

app.get('/rules.json', (request, response) => {
    // TODO: Change format of responseJson to combine all incoming and outgoing into rules.
    const responseJson = {
        rules: [],
        webfilter: {},
        dpi: true,
        virusScan: true,
        message: 'If the properties of this object are empty, you probably forgot to login first before performing the query.'
    };

    if (rules_final) {
        rules_final.forEach(rule => {
            responseJson.rules.push({
                priority: rule.priority,
                name: rule.name,
                allow: rule.allow,
                sourceip: rule.sourceip,
                sourceport: rule.sourceport,
                destip: rule.destip,
                destport: rule.destport,
                protocol: rule.protocol,
                state: rule.state,
                direction: rule.direction
            });
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