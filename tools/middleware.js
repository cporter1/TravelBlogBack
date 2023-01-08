const DB = require('./db-requests')
// check if provided cookie has not expired => pass on username
// check if username always request to access the data

function getCookieValue(cookie) {
    if(!cookie) return;

    let i = 0
    while (cookie.charAt(i) != '=') {i++}
    const slice = cookie.slice(i+1)
    return slice;
}

exports.validUserSessions = async function(req , res , next) {
    const cookieValue = getCookieValue(req.headers.cookie)
    
    await DB.getSessionByKey(cookieValue)
        .then(async result => {
            if(result.length === 0) res.sendStatus(401);
            else {
                req.username = result[0].username
                next()
            }
        })
        .catch(() => {res.sendStatus(401)})
}

function getUsernameFromSession(req , res , next) {
    
}