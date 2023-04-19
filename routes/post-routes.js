const express = require('express');
const router  = express.Router();
const DB = require('../tools/db-requests.js')
const multer = require('multer');
const upload = multer({dest: 'uploads/'})

const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)

const { formatPostArrayUploadImages, fetchPostsImages} 
    = require('../tools/s3-requests.js');

const { validUserSessions, needAdminPrivs } = require('../tools/middleware')

// maps from '/posts/...'

router
    .post('/featureblog' , needAdminPrivs, async (req,res) => {
        DB.featureBlog(req.body.blogID)
            .then( async () => res.sendStatus(200) )
            .catch(error => {console.error(error); res.sendStatus(500)})
    })

// routes below need a valid session

router.use(validUserSessions)

router
    .post('/createblog' ,needAdminPrivs, async (req , res) => {
        DB.createBlog(req.body.author , req.body.title)
            .then(res.sendStatus(200))
            .catch(error => {console.error(error); res.sendStatus(500)})
    })
    .get('/blogsbyauthor' , async (req,res) => {
        DB.getBlogsByAuthor(req.query.author)
            .then(async result => {res.send(result).status(200)})
            .catch(error => {console.error(error); res.sendStatus(500)})
    })
    .get('/allblogs' , async (req,res) => { 
        DB.getAllBlogs()
            .then(async result => {res.send(result)})
            .catch(error => {console.error(error); res.sendStatus(500)})
    })
    .post('/featureblog' , async (req , res) => {
        DB.featureBlog(req.body.blogID)
            .then(res.sendStatus(200))
            .catch(error => {console.error(error); res.sendStatus(500)})
    })
    .post('/createpost' , async (req ,res) => {
        DB.createPost( req.body.author , req.body.blogID ,
            Date.now() , req.body.title , req.body.publish)
            .then(async result  => res.send(result))
            .catch(error => {console.error(error); res.sendStatus(500)})
    })
    .get('/blogbyblogid' , async (req,res) => {
        DB.getBlogByBlogID(req.query.blogID)
            .then(async result => res.send(result))
            .catch(error => {console.error(error); res.sendStatus(500)})
    })
    .get('/postsbyblogid' , async (req,res) => {
        DB.getPostsByBlogID(req.query.id) 
            .then(async result => { // filter out non-published posts for blog guests
                // console.log(result)
                // console.log(req.username)
                if(result[0] === undefined) {res.send(result);return}
                let array = []
                if(result[0].author === req.username) { // owner's blog
                    array = result
                }
                else { // not the owner's blog
                    array = result.filter( element => element.published === true)
                }
                // console.log(await fetchPostsImages(array))
                res.send(await fetchPostsImages(array))
            }) 
            .catch(error => {console.error(error); res.sendStatus(500)})
    })
    .get('/postbypostid' , async (req,res) => {
        DB.getPostByPostID(req.query.postID)
            .then(async result => {
                if(result.rows[0].author !== req.username) res.sendStatus(401)
                else {
                    res.send(await fetchPostsImages(result.rows))}
            })
            .catch(error => {console.error(error); res.sendStatus(500)})
    })
    .post('/deletepost' , async (req, res) => {
        DB.deletePost(req.body.postID)
            .then( res.sendStatus(200))
            .catch(error => {console.error(error); res,sendStatus(500)})
    })  
    .get('/commentsbypostid' , async (req , res) => {
        DB.getCommentsByPostID(req.body.postID)
            .then(async result => {res.send(result).status(200)})
            .catch(error => {console.error(error); res.sendStatus(500)})
    })
    .post('/updatepostarray' , upload.array('array'), async (req , res) => {
        // console.log('/updatepostarray' , '[array]: ' , req.body['array'] , 
        //     'req.files: ' ,req.files, '[caption]: ' , req.body['text'] )
        formatPostArrayUploadImages(req.body['array'] , req.files , req.body['text'] , 
            unlinkFile )
            .then(async result => {
                // console.log(result)
                return DB.updatePostArray(result , req.body['postID'])})
            .then(async result => { DB.updateBlogLastActivity(result) })
            .then(res.sendStatus(200))
            .catch(error => {console.error(error); res.sendStatus(500)})
    })
    .post('/saveblogtraveldates' , async (req,res) => {
        DB.saveBlogTravelDates(req.body.travelDates , req.body.blogID)
            .then(async result => {res.sendStatus(200)})
            .catch(error => {console.error(error); res.sendStatus(500)})
    })
    .post('/saveblogtitle' , async (req,res) => {
        DB.saveBlogTitle(req.body.title , req.body.blogID)
            .then( res.sendStatus(200) )
            .catch(error => {console.error(error); res.sendStatus(500)})
    })
    .post('/saveposttitle' , async (req,res) => {
        DB.savePostTitle(req.body.postID , req.body.title)
            .then( res.sendStatus(200) )
            .catch(error => {console.error(error); res.sendStatus(500)})
    })
    .get('/getfeaturedblog' , async (req,res) => {
      DB.getFeaturedBlogAndPosts()
        .then(async result => {
          console.log('result', result[2])
          res.send([result[0] , await fetchPostsImages(result[1]), result[2] ]) })
        .catch(error => {console.error(error); res.sendStatus(500)})
    })
    .post('/publishpost' , async (req,res) => {
        DB.changePublishPostStatus(req.body.postID)
        .then( res.sendStatus(200) )
        .catch(error => {console.error(error); res.sendStatus(500)})

    })
    .post('/createcomment' , async (req,res) => {
      DB.createComment(req.username, req.body.body, req.body.createdAt, req.body.post_parent,
        req.body.blog_id)
        .then(res.sendStatus(200))
        .catch(error => {console.error(error); res.sendStatus(500)})
    })
    .get('/getpostcomments', async (req,res) => {
      DB.getCommentsByPostID(req.query.postID)
        .then(async result => { res.send(result) })
        .catch(error => {console.error(error); res.sendStatus(500)})
    })
    .post('/deletecomment', async (req,res) => {
      DB.deleteComment(req.body.ID)
        .then(res.sendStatus(200))
        .catch(error => {console.error(error); res.sendStatus(500)})
    })
    .post('/updatecomment', async (req,res) => {
      DB.updateComment(req.body.ID, req.body.body)
        .then(res.sendStatus(200))
        .catch(error => {console.error(error); res.sendStatus(500)})
    })
    .get('/getcommentsbyblogid', async (req , res) => {
      DB.getCommentsByBlogID(req.query.blogID)
        .then(async result => {console.log(result);res.send(result)})
        .catch(error => {console.error(error); res.sendStatus(500)})
    })




module.exports = router;