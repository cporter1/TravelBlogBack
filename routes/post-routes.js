const express = require('express');
const router  = express.Router();

router
    .get('/signin' , async (req , res) => {
        res.send('<div>/posts/signin</div>')
    })

module.exports = router;