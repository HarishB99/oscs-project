const express = require('express');
const firebase = require('firebase');
const axios = require('axios');
const cors = require('cors')({ origin: true });
const path = require('path');
// const bodyParser = require('body-parser');
const config = require('./modules/config.js').config;
const InputValidator = require('./modules/InputValidator').default;
firebase.initializeApp(config);
var dbc = require('fs').readFileSync('../proxy.config');
var dbConfig = JSON.parse(dbc);

const app = express();
const db = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
db.settings(settings);

let rules_final = null;
let filter_final = null;
let global_options_final = null;

app.use(express.json());
app.use(cors);

function datestring() {
    return new Date().toString().split(" GMT")[0];
}
const dateString = new Date().toString();
console.log(`Timezone: ${dateString.substring(dateString.indexOf("GMT"))}`);

app.set('view engine', 'pug')
app.get('/blocked', (req, res) => {
  res.redirect('http://' + dbConfig["nodeClientAddress"] + ':'+ dbConfig["nodeClientPort"] + '/b?reason=' + encodeURIComponent(req.query.reason));
});

app.get("/b", (req, res) => {
  res.render("blocked", {
    "reason" : req.query.reason
  });
});

app.get("/images/:picture", (req, res) => {
    res.sendFile(__dirname + "/images/" + req.params.picture)
});

app.get("/logs", (req, res) => {
  var MongoClient = require('mongodb').MongoClient;
  var url = dbConfig.proxyDBUrl;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var logdb = db.db("logDatabase");
    var usersCol = logdb.collection("users");
    var userLog = usersCol.find({}).toArray((err, result) => {
      res.render("logs", {
        "logs" : JSON.stringify(result)
      });
      db.close();
    })
  });
});

app.get("/styles/:style", (req, res) => {
  res.sendFile(__dirname + "/styles/" + req.params.style)
});

app.get("/scripts/:script", (req, res) => {
  res.sendFile(__dirname + "/scripts/" + req.params.script)
});

app.get("/clearlogs", (req, res) => {
  var MongoClient = require('mongodb').MongoClient;
  var url = dbConfig["proxyDBUrl"];
  MongoClient.connect(url, function(err, db) {
    if(err) throw err;
    var logdb = db.db("logDatabase");
    var usersCol = logdb.collection("users");
    //clear logs
    usersCol.remove({}, (err, noRemoved) => {
      if(err) res.send("failure");
      else res.send("success");
    });
  });
});

app.post('/login', (request, response) => {
    response.set('Accept', 'application/json');

    // For POST'
    // console.log(request.body)
    const { email, password } = request.body;

    if (InputValidator.isValidEmail(email) && InputValidator.isAReasonablyStrongPassword(password)) {
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
    } else {
        console.error(`${datestring()} [-] Error while logging in: Credentials received failed input validation: Email: ${email}, Passed Validation: ${InputValidator.isValidEmail(email)}, Password is empty, null or undefined: ${InputValidator.isEmpty(password)}, Password Passed Validation: ${InputValidator.isAReasonablyStrongPassword(password)}`);
        response.send('Email and password failed input validation.');
    }
});

firebase.auth().onAuthStateChanged(user => {
    console.log(`${datestring()} [+] Detected authentication state change`);
    if (!InputValidator.isEmpty(user)) {
        console.log(`${datestring()} [+] User logged in: ${user.displayName}`);
        if (user.emailVerified) {
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

            db.doc(`/users/${uid}/options/global`)
            .onSnapshot(optionsDoc => {
                console.log(`${datestring()} [+] Retrieving options...`);
                global_options_final = optionsDoc.data();
                console.log(`${datestring()} [+] Retrieved options sucessfully`);
            });
        } else {
            console.log(`${datestring()} [-] User has not verified his/her email.`);
        }
    } else {
        console.log(`${datestring()} [-] No user logged in.`);
    }
});

app.get('/rules.json', (request, response) => {
    const responseJson = {
        rules: [],
        webfilter: {
            fakeNews: true,
            socialMedia: true,
            gambling: true,
            pornography: true,
            blacklist: [],
            whitelist: [],
            blockAds: true,
            blockMalicious: true,
        },
        childSafety: true,
        virusScan: true,
        message: 'If the properties of this object are empty, you probably forgot to login first or have not verified your email before performing this query.'
    };

    if (rules_final) {
        rules_final.forEach(rule => {
            responseJson.rules.push(rule);
        });
    }

    if (filter_final) {
        responseJson.webfilter.whitelist = filter_final.whitelist;
        responseJson.webfilter.blacklist = filter_final.blacklist;
        responseJson.webfilter.fakeNews = filter_final.fakeNews;
        responseJson.webfilter.socialMedia = filter_final.socialMedia;
        responseJson.webfilter.gambling = filter_final.gambling;
        responseJson.webfilter.pornography = filter_final.pornography;
    }

    if (global_options_final) {
        responseJson.childSafety = global_options_final.childSafety;
        responseJson.virusScan = global_options_final.virusScan;
        responseJson.webfilter.blockAds = global_options_final.blockAds;
        responseJson.webfilter.blockMalicious = global_options_final.blockMalicious;
    }

    response.json(responseJson);
});

// More functionalities will be added when deemed necessary

app.listen(3000);
