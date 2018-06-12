const functions = require('firebase-functions');
const firebase = require("firebase-admin");
const express = require("express");

const firebaseApp = firebase.initializeApp(
    functions.config().firebase
);

const db = firebaseApp.firestore();

// let rules = [];

// db.collection('rules').get().then(snapshot => {
//     snapshot.forEach(doc => {
//         rules.push({
//             "name": doc.id,
//             "params": doc.data()
//         });
//     });
//     return;
// }).catch(err => {
//     console.error("Error while retrieving rules from cloud firestore", err);
// });

// db.collection('rules').doc('http').set({
//     "priority": 100,
//     "allow": true,
//     "sourceip" : "0.0.0.0",
//     "sourceport": "80",
//     "destip": "0.0.0.0",
//     "destport": "*",
//     "protocol" : "tcp",
//     "state" : "NEW,ESTABLISHED,RELATED",
//     "direction": "Inbound"
// }).then(time => {
//     return;
// }).catch(err => {
//     console.error("Error writing to the database", err);
// });

const app = express();
app.get("/rules.json", (request, response) => {
    // Hopefully this is ok
    // 
    // The following line sets the Cache Control such that 
    // the firewall rules can be cached to a CDN server (hence 
    // the option "public")
    //
    // max-age: store the cache in the browser for 300s
    // s-maxage: store the cache in the CDN for 600s
    // response.set("Cache-Control", "public, max-age=300, s-maxage=600");
    let rulesRef = db.collection('rules');
    rulesRef.get().then(rules => {
        let responseJson = {
            "firewallRules": {
                "incoming": [],
                "outgoing": [],
                "webfilter": {}
            },
            "dpi": true,
            "virusScan": true
        };
        rules.forEach(rule => {
            let ruleData = rule.data();
            let ruleName = ruleData.name;
            let params = ruleData.params;
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
        });
        
        response.json(responseJson);
    }).catch(err => {
        console.log("An error occurred while trying to access the database", err);
        // There is a reason why I am not sending error 500
        response.send("An unexpected error occurred.");
    });
});

exports.app = functions.https.onRequest(app);