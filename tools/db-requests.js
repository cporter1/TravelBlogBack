const {Pool} = require('pg')
const dbConfig = require('../config/db-config.js')

// ACCOUNTS //

async function createAccount(username , password , email , role) {
    let pool = await new Pool(dbConfig)
    let data = await pool.query(`INSERT INTO accounts(username , password , email , role)
        VALUES( $1 , $2 , $3 , $4)` , [username , password , email , role])
    pool.end()
    return data.rows
}

// async function getAllAccounts() {
//     let pool = await new Pool(dbConfig)
//     let data = await pool.query('SELECT * FROM accounts' , [email])
//     pool.end()
//     return data.rows
// }

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
    pool.end()
    return blogData.rows
}

async function getAllBlogs() {
    let pool = await new Pool(dbConfig)
    let blogData = await pool.query(`SELECT * FROM blogs`)
    pool.end()
    return blogData.rows
}

async function getBlogByBlogID(blogID) {
    let pool = await new Pool(dbConfig)
    let data = await pool.query(`SELECT * FROM blogs WHERE id = $1`, [blogID])
    pool.end()
    return data.rows
}

async function getPostsByBlogID(blogID) {
    let pool = await new Pool(dbConfig)
    let postsData = await pool.query(`SELECT * FROM posts WHERE blog_id = $1` ,
        [blogID])
    pool.end()
    return postsData
}

async function getPostByPostID(postID) {
    let pool = await new Pool(dbConfig)
    let data = await pool.query(`SELECT * FROM posts WHERE id = $1 LIMIT 1`,
        [postID])
    pool.end()
    return data
}

async function createPost(author , blogID , timePosted , title , publish) {
    let pool = await new Pool(dbConfig)
    let data = await pool.query(`INSERT INTO posts(author , blog_id , time_posted , title , published)
        VALUES($1 , $2 , $3 , $4 , $5) RETURNING id` , [author , blogID , timePosted , title, publish])
    pool.end()
    return data.rows
}

async function updatePostArray(bodyArray , postID) {
    let pool = await new Pool(dbConfig)
    let data = await pool.query(`UPDATE posts SET body_array = $1 WHERE id = $2 
        RETURNING blog_id` , [bodyArray , postID])
    pool.end()
    return data.rows[0].blog_id
}

async function saveBlogTravelDates(dates , blogID) {
    let pool = await new Pool(dbConfig)
    await pool.query(`UPDATE blogs SET travel_dates = $1 WHERE id = $2` , [dates , blogID])
    pool.end()
    return;
}

async function saveBlogTitle(title , blogID) {
    let pool = await new Pool(dbConfig)
    await pool.query(`UPDATE blogs SET title = $1 WHERE id = $2` , [title , blogID])
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

async function getFeaturedBlogAndPosts() {
    let pool = await new Pool(dbConfig)
    const blogData = await pool.query('SELECT * FROM blogs WHERE featured = TRUE LIMIT 1')
    const bodyData = await pool.query('SELECT * FROM posts WHERE blog_id = $1' , [blogData.rows[0].id])
    pool.end()
    return [blogData.rows[0] , bodyData.rows]
}

async function changePublishPostStatus(postID) {
    let pool = await new Pool(dbConfig)
    await pool.query('UPDATE posts SET published = NOT published WHERE id = $1' , [postID])
    pool.end()
    return;
}

async function updateBlogLastActivity(blogID , date = Date.now()) {
    let pool = await new Pool(dbConfig)
    await pool.query('UPDATE blogs SET last_updated = $1 WHERE id = $2' , [date , blogID])
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

exports.getFeaturedBlogAndPosts = getFeaturedBlogAndPosts;
exports.updateBlogLastActivity  = updateBlogLastActivity;
exports.changePublishPostStatus = changePublishPostStatus;
exports.saveBlogTitle       = saveBlogTitle;
exports.saveBlogTravelDates = saveBlogTravelDates;
exports.getBlogByBlogID     = getBlogByBlogID;
exports.createAccount       = createAccount;
exports.getAccount          = getAccount;
exports.createSession       = createSession;
exports.getSessionByKey     = getSessionByKey;
exports.deleteSession       = deleteSession;
exports.createBlog          = createBlog;
exports.featureBlog         = featureBlog;
exports.getBlogsByAuthor    = getBlogsByAuthor;
exports.getAllBlogs         = getAllBlogs;
exports.getPostsByBlogID    = getPostsByBlogID;
exports.getPostByPostID     = getPostByPostID;
exports.createPost          = createPost;
exports.updatePostArray     = updatePostArray
exports.createComment       = createComment;
exports.getCommentsByPostID = getCommentsByPostID;