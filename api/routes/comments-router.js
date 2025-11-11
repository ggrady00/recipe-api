const { getCommentsByID, postCommentByID, removeCommentByCommentID, getComments } = require("../controllers/comments-controllers")
const { authenticateToken } = require("../middleware/auth")

const commentsRouter = require("express").Router()

commentsRouter
.route("/:id")
.get(getCommentsByID)
.post(authenticateToken, postCommentByID)
.delete(authenticateToken, removeCommentByCommentID)

commentsRouter
.route("/")
.get(getComments)

module.exports = commentsRouter