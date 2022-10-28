const {Pool} = require('pg')
const dbConfig = require('../config/db-config.js')

async function createAccount(username , password , email , role) {
    let pool = await new Pool(dbConfig)
    pool.query(`INSERT INTO accounts(username , password , email , role)
        VALUES( $1 , $2 , $3 , $4)` , [username , password , email , role])
        .then( () => { pool.end(); return } ) 
        .catch(error => {pool.end(); return error })
}

async function getAccount(email) {
    let pool = await new Pool(dbConfig)
    pool.query('SELECT * FROM accounts WHERE email = $1' , [email])
        .then(data => { pool.end(); return data.rows } )
        .catch(error => {pool.end(); return error })
}

async function createBlog(author) {
    let pool = await new Pool(dbConfig)
    pool.query(`INSERT INTO blogs(author) 
        VALUES( $1 )` , [author])
        .then( () => { pool.end(); return })
        .catch(error => {pool.end(); return error })
}

async function getBlogsByAuthor(author) {
    let pool = await new Pool(dbConfig)
    pool.query(`(SELECT * FROM blogs WHERE author = $1) 
        UNION (SELECT * FROM posts WHERE author = $1)` , [author])
        .then(data => { pool.end(); return data.rows})
        .catch(error => {pool.end(); return error })
}

async function getAllBlogsAndPosts() {
    let pool = await new Pool(dbConfig)
    pool.query(`(SELECT * FROM blogs) UNION (SELECT * FROM posts )`)
        .then(data => { pool.end(); return data.rows})
        .catch(error => {pool.end(); return error })
}

async function createPost(author , blogID , bodyArray) {
    let pool = await new Pool(dbConfig)
    pool.query(`INSERT INTO posts(author , blog_id , body_array)
        VALUES($1 , $2 , $3)` , [author , blogID , bodyArray])
        .then(() => { pool.end(); return})
        .catch(error => {pool.end(); return error })
}

async function createComment(author , body , timePosted , postID) {
    let pool = await new Pool(dbConfig)
    pool.query( `INSERT INTO comments(author , body , time_posted , post_id)
        VALUES($1 , $2 , $3 , $4)` , [author , body , timePosted , postID] )
        .then(() => { pool.end(); return})
        .catch(error => {pool.end(); return error })
}

async function getCommentsByPostID(ID) {
    let pool = await new Pool(dbConfig)
    pool.query(`SELECT * FROM comments WHERE post_id = $1` , [ID])
    .then(data => { pool.end(); return data.rows })
    .catch(error => {pool.end(); return error })
}



exports.createAccount       = createAccount
exports.getAccount          = getAccount
exports.createBlog          = createBlog
exports.getBlogsByAuthor    = getBlogsByAuthor
exports.getAllBlogsAndPosts = getAllBlogsAndPosts
exports.createPost          = createPost
exports.createComment       = createComment
exports.getCommentsByPostID = getCommentsByPostID
