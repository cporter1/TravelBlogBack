const express = require('express')
const app = express()

const bodyParser  = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));

const accRoutes = require('./routes/account-routes')
const postRoutes = require('./routes/post-routes')

const http = require('http')

// // TEST
// const { uploadImage } = require('./tools/s3-requests')
// const fs = require('fs')

// app.post('/images' , async (req , res) => {

//     const file = fs.createReadStream('./mountain-background.jpg')
//     await uploadImage(file)
//     res.send('yup')
// })
// END TEST

// Access Control

app.use( (req , res, next ) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://192.168.1.211:3000')
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