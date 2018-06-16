import * as functions from 'firebase-functions';
import * as firebase from 'firebase-admin'
import * as express from 'express'

firebase.initializeApp()

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const db = firebase.firestore()
const incomingRulesRef = db.collection('incoming')
const outgoingRulesRef = db.collection('outgoing')
// const webFilterRef = db.collection('webfilter')

const app = express()

class Rule {
    constructor(public priority: number, public name: string, public allow: boolean, public sourceip: string, public sourceport: string, public destip: string, public destport: string, public protocol: string, public state: string) {}
}

interface Rule {
    priority: number
    allow: boolean
    sourceip: string
    sourceport: string
    destip: string
    destport: string
    protocol: string
    state: string
}

app.get('/rules.json', async (request, response) => {
    // The following line sets the Cache Control such that 
    // the firewall rules can be cached to a CDN server (hence 
    // the option "public")
    //
    // max-age: store the cache in the browser for 300s
    // s-max-age: store the cache in the CDN for 600s
    // response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    try {
        const incomingRules = await incomingRulesRef.get()
        const outgoingRules = await outgoingRulesRef.get()
        // const webfilter = await webFilterRef.get()
        const responseJson = {
            firewallRules: {
                incoming: [],
                outgoing: [],
                webfilter: {}
            },
            dpi: true,
            virusScan: true
        }
        incomingRules.forEach(rule => {
            const params = rule.data();
            const name = rule.id
            responseJson.firewallRules.incoming.push(
                new Rule(params.priority, name, params.allow, params.sourceip, 
                    params.sourceport, params.destip, params.destport, 
                    params.protocol, params.state)
            )
        })
        outgoingRules.forEach(rule => {
            const params = rule.data();
            const name = rule.id
            responseJson.firewallRules.outgoing.push(
                new Rule(params.priority, name, params.allow, params.sourceip, 
                    params.sourceport, params.destip, params.destport, 
                    params.protocol, params.state)
            )
        })
        response.json(responseJson)
    } catch (error) {
        console.log(error)
        response.send('An unexpected error occurred')
    }
})

export const web_app = functions.https.onRequest(app)