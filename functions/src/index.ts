import * as functions from 'firebase-functions';
import * as firebase from 'firebase-admin'
import * as express from 'express'
import * as crypto from 'crypto'
import { Buffer } from 'buffer';

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

async function encrypt(...args: string[]) {
    let plainText = ''
    let password = 'toUnlockThis@nypsit'
    if (args.length > 0) {
        plainText = args[0]
    }
    if (args.length > 1) {
        password = args[1]
    }
    const cipher = crypto.createCipher('aes256', password)
    let encrypted = cipher.update(plainText, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
}

async function decrypt(...args: string[]) {
    let cipherText = ''
    let password = 'toUnlockThis@nypsit'
    if (args.length > 0) {
        cipherText = args[0]
    }
    if (args.length > 1) {
        password = args[1]
    }
    const cipher = crypto.createDecipher('aes256', password)
    let decrypted = cipher.update(cipherText, 'hex', 'utf8')
    decrypted += cipher.final('hex')
    return decrypted
}

async function hash(plainText: string) {
    const hash_computer = crypto.createHash('sha512')
    hash_computer.update(plainText)
    return hash_computer.digest('hex')
}

// app.get('/create-test-user', async (request, response) => {
//     const salt = crypto.pseudoRandomBytes(64).toString('hex') // Number represents number of bytes
//     const encryptedSalt = await encrypt(salt)
//     const password = "secretTestPassword"
//     const encryptedPassword = await encrypt(password)
//     const hashedPassword = await hash(encryptedPassword+salt)
    
//     try {
//         const userRecord = await firebase.auth().createUser({
//             email: "test@example.com",
//             emailVerified: false,
//             phoneNumber: "+6587127475",
//             displayName: "Tester 1",
//             photoURL: "https://material.io/tools/icons/static/icons/baseline-perm_identity-24px.svg",
//             disabled: false
//         })
//         console.log("Successfully created new user", userRecord.uid)
//         const writeStatus = await firebase.firestore().doc(`/users/${userRecord.uid}`).set({
//             email: userRecord.email,
//             phoneNumber: userRecord.phoneNumber,
//             displayName: userRecord.displayName,
//             password: hashedPassword,
//             salt: encryptedSalt,
//             emailVerified: userRecord.emailVerified,
//             disabled: userRecord.disabled,
//             photoURL: userRecord.photoURL,
//             organisation: 'example.org'
//         })
//         console.log("Status of account write operation to database: ", writeStatus)
//         response.send('User Creation Successful')
//     } catch (error) {
//         console.error("Error creating new user", error)
//         response.send('Internal Error')
//     }
// })

app.get('/login', async (request, response) => {
    try {
        const email = request.params.username
        const pass = request.params.pass
        const userRecord = await firebase.auth().getUserByEmail(email)
        const dbUserRecord = await firebase.firestore().doc(`/users/${userRecord.uid}`).get()
        const salt = await decrypt(dbUserRecord.get('salt'))
        const encryptedPass = await encrypt(pass)
        const hashedPass = await hash(encryptedPass + salt)
        console.log("hashedPass: ", hashedPass)
        console.log('hashedPassword: ', dbUserRecord.get('password'))
        if (crypto.timingSafeEqual(Buffer.from(hashedPass), Buffer.from(dbUserRecord.get('password'))))
            response.send('Your username is ' + dbUserRecord.get('displayName'))
        else
            response.send('Access denied')
    } catch (error) {
        response.end('Access denied')
    }
})

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

export const createNewUser = functions.auth.user().onCreate(async user => {
    // const uid = user.uid
    // const email = user.email
    // const photoURL = user.photoURL
    // const phoneNumber = user.phoneNumber
    console.log("UserRecord created", user)
})