const { getCommentsByID, postCommentByID, removeCommentByCommentID } = require("../controllers/comments-controllers")
const { authenticateToken } = require("../middleware/auth")

const commentsRouter = require("express").Router()

commentsRouter
.route("/:id")
.get(getCommentsByID)
.post(authenticateToken, postCommentByID)
.delete(authenticateToken, removeCommentByCommentID)

module.exports = commentsRouter