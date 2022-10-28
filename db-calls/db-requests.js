const {Pool} = require('pg')
const dbConfig = require('../config/db-config.js')

// ACCOUNTS //

async function createAccount(username , password , email , role) {
    let pool = await new Pool(dbConfig)
    pool.query(`INSERT INTO accounts(username , password , email , role)
        VALUES( $1 , $2 , $3 , $4)` , [username , password , email , role])
        .then( () => { pool.end(); return } ) 
        .catch(error => {pool.end(); return error })
}

async function getAccount(email) {
    let pool = await new Pool(dbConfig)
    pool.query('SELECT * FROM accounts WHERE email = $1 limit 1' , [email])
        .then(data => { pool.end(); return data.rows } )
        .catch(error => {pool.end(); return error })
}

// SESSIONS

async function createSession(email , tokenExpire , key) {
    let pool = await new Pool(dbConfig)
    pool.query(`INSERT INTO sessions(email , token_expire , key)
        VALUES($1 , $2 , $3)` , [email , tokenExpire , key])
        .then( () => { pool.end(); return } ) 
        .catch(error => {pool.end(); return error })
}

async function getSessionByKey(key) {
    let pool = await new Pool(dbConfig)
    pool.query('SELECT * FROM sessions WHERE key = $1 limit 1', [key])
    .then(data => { pool.end(); return data.rows } )
    .catch(error => {pool.end(); return error })
}

// BLOGS & POSTS //

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

async function createPost(author , blogID , bodyArray , timePosted) {
    let pool = await new Pool(dbConfig)
    pool.query(`INSERT INTO posts(author , blog_id , body_array , time_posted)
        VALUES($1 , $2 , $3 , $4)` , [author , blogID , bodyArray , timePosted])
        .then(() => { pool.end(); return})
        .catch(error => {pool.end(); return error })
}

// COMMENTS //

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



exports.createAccount       = createAccount;
exports.getAccount          = getAccount;
exports.createSession       = createSession;
exports.getSessionByKey     = getSessionByKey;
exports.createBlog          = createBlog;
exports.getBlogsByAuthor    = getBlogsByAuthor;
exports.getAllBlogsAndPosts = getAllBlogsAndPosts;
exports.createPost          = createPost;
exports.createComment       = createComment;
exports.getCommentsByPostID = getCommentsByPostID;