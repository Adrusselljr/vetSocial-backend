const express = require('express')
const router = express.Router()
const { createComment, getUserComments, updateComment, deleteComment } = require('./controller/commentController')
const { checkIsEmpty, jwtMiddleware } = require('../validator/lib/index')

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('Hello World from commentsRouter')
})

router.post('/create-comment/:id', checkIsEmpty, jwtMiddleware, createComment)
router.get('/all-comments/', jwtMiddleware, getUserComments)
router.put('/update-comment/:id', jwtMiddleware, checkIsEmpty, updateComment)
router.delete('/delete-comment/:id', checkIsEmpty, jwtMiddleware, deleteComment)

module.exports = router