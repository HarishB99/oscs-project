const functions = require('firebase-functions');
const firebase = require("firebase-admin");
const express = require("express");

const firebaseApp = firebase.initializeApp(
    functions.config().firebase
);

const db = firebaseApp.firestore();

let rules = [];

db.collection('rules').get().then(snapshot => {
    snapshot.forEach(doc => {
        rules.push({
            "name": doc.id,
            "params": doc.data()
        });
    });
    return;
}).catch(err => {
    console.error("Error while retrieving rules from cloud firestore", err);
});

const app = express();
app.get("/rules.json", (request, response) => {
    let responseJson = {
        "firewallRules": {
            "incoming": [],
            "outgoing": [],
            "webfilter": {}
        },
        "dpi": true,
        "virusScan": true
    };
    for (let i in rules) {
        let currentRule = rules[i];
        let ruleName = currentRule.name;
        let params = currentRule.params;
        let parsedRule = {
            "priority": params.priority,
            "name": ruleName,
            "allow": params.allow,
            "sourceip" : params.sourceip,
            "sourceport": params.sourceport,
            "destip": params.destip,
            "destport": params.destport,
            "protocol" : params.protocol,
            "state" : params.state
        };
        if (params.direction === "Inbound") {
            responseJson.firewallRules.incoming.push(parsedRule);
        } else if (params.direction === "Outbound") {
            responseJson.firewallRules.outgoing.push(parsedRule);
        } else {
            console.error("There was an error parsing rules retrieved from database. Database may be corrupted.");
        }
    }

    response.json(responseJson);
});

exports.app = functions.https.onRequest(app);