const {Pool} = require('pg')
const dbConfig = require('../config/db-config.js')

// ACCOUNTS //

async function createAccount(username , password , email , role) {
    let pool = await new Pool(dbConfig)
    await pool.query(`INSERT INTO accounts(username , password , email , role)
        VALUES( $1 , $2 , $3 , $4)` , [username , password , email , role])
    pool.end()
    return;
}

async function getAccount(email) {
    let pool = await new Pool(dbConfig)
    let data = await pool.query('SELECT * FROM accounts WHERE email = $1 limit 1' , [email])
    pool.end()
    return data.rows
}

// SESSIONS

async function createSession(email , tokenExpire , key) {
    let pool = await new Pool(dbConfig)
    await pool.query('DELETE FROM sessions WHERE email = $1' , [email])
    await pool.query(`INSERT INTO sessions(email , token_expire , key)
        VALUES($1 , $2 , $3)` , [email , tokenExpire , key])
    pool.end()
    return;
}

async function getSessionByKey(key) {
    let pool = await new Pool(dbConfig)
    let data = await pool.query('SELECT * FROM sessions WHERE key = $1 limit 1', [key])
    pool.end()
    return data.rows
}

async function deleteSession(key) {
    let pool = await new Pool(dbConfig);
    await pool.query(`DELETE FROM sessions WHERE id IN (SELECT id FROM sessions WHERE key = $1)` , [key])
    pool.end()
    return;
}

// BLOGS & POSTS //

async function createBlog(author , title) {
    let pool = await new Pool(dbConfig)
    await pool.query(`INSERT INTO blogs(author , title) 
        VALUES( $1 , $2 )` , [author , title])
    pool.end()
    return;
}

async function getBlogsByAuthor(author) {
    let pool = await new Pool(dbConfig)
    let blogData = await pool.query(`SELECT * FROM blogs WHERE author = $1` , [author])
    let postData = await pool.query(`SELECT * FROM posts WHERE author = $1` , [author])
    let data = ['blogs' , ...blogData.rows , 'posts' ,  ...postData.rows]
    pool.end()
    return data
}

async function getAllBlogsAndPosts() {
    let pool = await new Pool(dbConfig)
    let blogData = await pool.query(`SELECT * FROM blogs`)
    let postData = await pool.query(`SELECT * FROM posts`)
    let data = ['blogs' , ...blogData.rows , 'posts' ,  ...postData.rows]
    pool.end()
    return data
}

async function createPost(author , blogID , bodyArray , timePosted , title) {
    let pool = await new Pool(dbConfig)
    await pool.query(`INSERT INTO posts(author , blog_id , body_array , time_posted , title)
        VALUES($1 , $2 , $3 , $4 , $5)` , [author , blogID , bodyArray , timePosted , title])
    pool.end()
    return;
}

async function featureBlog(blogID) {
    let pool = await new Pool(dbConfig)
    await pool.query('UPDATE blogs SET featured = FALSE')
    await pool.query('UPDATE blogs SET featured = TRUE WHERE id = $1' , [blogID])
    pool.end()
    return;
}

// COMMENTS //

async function createComment(author , body , timePosted , postID) {
    let pool = await new Pool(dbConfig)
    await pool.query( `INSERT INTO comments(author , body , time_posted , post_id)
        VALUES($1 , $2 , $3 , $4)` , [author , body , timePosted , postID] )
    pool.end()
    return;
}

async function getCommentsByPostID(ID) {
    let pool = await new Pool(dbConfig)
    let data = await pool.query(`SELECT * FROM comments WHERE post_id = $1` , [ID])
    pool.end()
    return data.rows;
}



exports.createAccount       = createAccount;
exports.getAccount          = getAccount;
exports.createSession       = createSession;
exports.getSessionByKey     = getSessionByKey;
exports.deleteSession       = deleteSession;
exports.createBlog          = createBlog;
exports.featureBlog         = featureBlog;
exports.getBlogsByAuthor    = getBlogsByAuthor;
exports.getAllBlogsAndPosts = getAllBlogsAndPosts;
exports.createPost          = createPost;
exports.createComment       = createComment;
exports.getCommentsByPostID = getCommentsByPostID;