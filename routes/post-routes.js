const express = require('express');
const router  = express.Router();
const DB = require('../db-calls/db-requests.js')

// maps from '/posts/...'

router
    .post('/createblog' , async (req , res) => {
        DB.createBlog(req.body.author , req.body.title)
            .then(res.sendStatus(200))
            .catch(error => {console.log(error); res.sendStatus(500)})
    })
    .get('/blogsbyauthor' , async (req,res) => {
        DB.getBlogsByAuthor(req.body.author)
            .then(async result => {res.send(result).status(200)})
            .catch(error => {console.log(error); res.sendStatus(500)})
    })
    .get('/allblogs' , async (req,res) => { 
        DB.getAllBlogsAndPosts()
            .then(async result => {res.send(result).status(200)})
            .catch(error => {console.log(error); res.sendStatus(500)})
    })
    .post('/featureblog' , async (req , res) => {
        DB.featureBlog(req.body.blogID)
            .then(res.sendStatus(200))
            .catch(error => {console.log(error); res.sendStatus(500)})
    })
    .post('/createpost' , async (req ,res) => {
        DB.createPost( req.body.author , req.body.blogID , req.body.bodyArray,
            req.body.timePosted , req.body.title)
            .then(res.sendStatus(200))
            .catch(error => {console.log(error); res.sendStatus(500)})
    })
    .post('/createcomment' , async (req , res) => {
        DB.createComment(req.body.author , req.body.body , 
            req.body.timePosted , req.body.postID)
            .then(res.sendStatus(200))
            .catch(error => {console.log(error); res.sendStatus(500)})
    })
    .get('/commentsbypostid' , async (req , res) => {
        DB.getCommentsByPostID(req.body.postID)
            .then(async result => {res.send(result).status(200)})
            .catch(error => {console.log(error); res.sendStatus(500)})
    })


module.exports = router;