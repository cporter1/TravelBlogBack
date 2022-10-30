const express = require('express')
const app = express()

const bodyParser  = require('body-parser');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));

const accRoutes = require('./routes/account-routes')
const postRoutes = require('./routes/post-routes')

const http = require('http')

app.use('/accounts' , accRoutes);
app.use('/posts'    , postRoutes);

http.createServer(app).listen(8080 ,() => {
    console.log('server started on port ' + 8080)
})