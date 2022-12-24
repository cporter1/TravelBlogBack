const express = require('express')
const app = express()

const bodyParser  = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));

const accRoutes = require('./routes/account-routes')
const postRoutes = require('./routes/post-routes')

const http = require('http')
require('dotenv').config();

// Access Control

app.use( (req , res, next ) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ALLOW_ORIGIN)
    res.setHeader('Access-Control-Allow-Credentials' , 'true')
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next()
})


app.use('/accounts' , accRoutes);
app.use('/posts'    , postRoutes);

http.createServer(app).listen(8080 , () => {
    console.log('server started on port ' + 8080)
})