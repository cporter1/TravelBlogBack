const express = require('express');
const router  = express.Router();
const DB = require('../tools/db-requests.js')

const bcrypt = require('bcrypt')
const crypto = require('crypto')
const {needAdminPrivs} = require('../tools/middleware')

// maps from '/accounts/...'

function tokenGenerator() {
    return (Math.random() + 1).toString(30).substring(2)
}

function getCookieValue(cookie) {
    if(!cookie) return;

    let i = 0
    while (cookie.charAt(i) != '=') {i++}
    const slice = cookie.slice(i+1)
    return slice;
}

router
    .post('/signin' , async (req , res) => {
        DB.getAccount(req.body.username)
            .then(async result => {
                if(await bcrypt.compare(req.body.password, result[0]['password'])) {
                    const newToken = tokenGenerator()
                    res.cookie('session-cookie', newToken , {
                        secure: false,
                        httpOnly: false,
                    })
                    DB.createSession(result[0].username, Date.now() + (1000*60*60) , newToken, result[0].role) 
                        .then(async () => {res.send(result).status(200)})
                        .catch(error => { console.log(error); res.sendStatus(500)})
                } // password do not match
                else {res.sendStatus(401)}
            })
            .catch(error => {
                console.log(error)
                res.sendStatus(401)})
    })
    .post('/createaccount', needAdminPrivs, async (req , res) => {
        const hashedPassword = await bcrypt.hash(req.body.password , 10)
        DB.createAccount(req.body.username , hashedPassword , req.body.email , req.body.role)
            .then(()  => res.sendStatus(200))
            .catch(error => {console.log("ERROR" , error) ; res.sendStatus(500)})
    })
    .post('/signout' , async (req , res) => {
        //delete cookie
        res.cookie('session-cookie' , null , {maxAge: 0})

        DB.deleteSession( getCookieValue(req.headers.cookie) )
            .then(res.sendStatus(200))
            .catch(error => {console.log('signOut Error: ', error); res.sendStatus(500)})
    })
    .get('/allaccounts', async (req, res) => {
        DB.getAllAccounts()
            .then(async result => {res.send(result)})
            .catch(err => res.sendStatus(500))
    })

module.exports = router;