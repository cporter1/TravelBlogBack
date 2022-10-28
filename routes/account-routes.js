const express = require('express');
const router  = express.Router();
const DB = require('../db-calls/db-requests.js')

router
    .get('/signin' , async (req , res) => {
        res.send('<div>hi</div>')
    })
    .post('/createaccount', async (req , res) => {

        DB.createAccount(req.body.username , req.body.password , req.body.email , req.body.role)
            .then( async ()  => res.sendStatus(200))
            .catch(error => {res.sendStatus(500)})
    })

module.exports = router;