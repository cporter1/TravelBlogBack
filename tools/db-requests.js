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

async function getAllAccounts() {
    let pool = await new Pool(dbConfig)
    let data = await pool.query('SELECT username, email, role FROM accounts')
    pool.end()
    return data.rows
}

async function getAccount(email) {
    let pool = await new Pool(dbConfig)
    let data = await pool.query('SELECT * FROM accounts WHERE email = $1 limit 1' , [email])
    pool.end()
    return data.rows
}

// SESSIONS

async function createSession(username, tokenExpire , key, role) {
    let pool = await new Pool(dbConfig)
    await pool.query('DELETE FROM sessions WHERE username = $1' , [username])
    await pool.query(`INSERT INTO sessions(username , token_expire , key, role)
        VALUES($1 , $2 , $3, $4)` , [username, tokenExpire , key, role])
    pool.end()
    return;
}

async function getSessionByKey(key) {
    let pool = await new Pool(dbConfig)
    let data = await pool.query('SELECT * FROM sessions WHERE key = $1', [key])
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
    let blogData = await pool.query(`SELECT * FROM blogs WHERE author = $1 ORDER BY last_updated DESC` , [author])
    pool.end()
    return blogData.rows
}

async function getAllBlogs() {
    let pool = await new Pool(dbConfig)
    let blogData = await pool.query(`SELECT * FROM blogs ORDER BY last_updated DESC`)
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
    let postsData = await pool.query(`SELECT * FROM posts WHERE blog_id = $1 ORDER BY time_posted DESC` ,
        [blogID])
    pool.end()
    return postsData.rows
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

async function deletePost(postID) {
  let pool = await new Pool(dbConfig)
  await pool.query('DELETE FROM posts WHERE id = $1' , [postID])
  pool.end()
  return;
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

async function savePostTitle(postID, title) {
    let pool = await new Pool(dbConfig)
    await pool.query(`UPDATE posts SET title = $2 WHERE id = $1` , [postID , title])
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
  const bodyData = 
    await pool.query('SELECT * FROM posts WHERE blog_id = $1 AND published = TRUE ORDER BY time_posted DESC', 
    [blogData.rows[0].id])
  const comments = 
    await pool.query('SELECT * FROM comments WHERE blog_parent = $1 ORDER BY post_parent DESC, created_at ASC',
    [blogData.rows[0].id])
  pool.end()
  return [blogData.rows[0] , bodyData.rows, comments.rows]
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

async function createComment(author , body , timePosted , postID, blogID) {
    let pool = await new Pool(dbConfig)
    await pool.query( `INSERT INTO comments(author , body , created_at , post_parent, blog_parent)
        VALUES($1 , $2 , $3 , $4, $5)` , [author , body , timePosted , postID, blogID] )
    pool.end()
    return;
}

async function getCommentsByBlogID(ID) {
  let pool = await new Pool(dbConfig)
  const comments = 
    await pool.query('SELECT * FROM comments WHERE blog_parent = $1 ORDER BY post_parent DESC, created_at ASC',
    [ID])
  pool.end()
  return comments.rows;
}

async function deleteComment(ID) {
  let pool = await new Pool(dbConfig)
  await pool.query('DELETE FROM comments WHERE id = $1' , [ID])
  pool.end()
  return;
}

async function updateComment(ID, body) {
  let pool = await new Pool(dbConfig)
  await pool.query('UPDATE comments SET body = $2 WHERE id = $1', [ID, body])
  pool.end()
  return;
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
exports.getCommentsByBlogID = getCommentsByBlogID;
exports.deletePost          = deletePost
exports.getAllAccounts = getAllAccounts;
exports.savePostTitle = savePostTitle;
exports.deleteComment = deleteComment;
exports.updateComment = updateComment;