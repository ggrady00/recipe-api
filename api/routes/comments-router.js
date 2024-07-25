const { getCommentsByID, postCommentByID } = require("../controllers/comments-controllers")
const { authenticateToken } = require("../middleware/auth")

const commentsRouter = require("express").Router()

commentsRouter
.route("/:id")
.get(getCommentsByID)
.post(authenticateToken, postCommentByID)

module.exports = commentsRouter