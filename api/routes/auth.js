const { postNewUser, postLoginIn, getProfile } = require("../controllers/auth-controller")
const { authenticateToken } = require("../middleware/auth")



const authRouter = require("express").Router()

authRouter
.route("/register")
.post(postNewUser)

authRouter
.route("/login")
.post(postLoginIn)

authRouter
.route("/profile")
.get(authenticateToken, getProfile)

module.exports = authRouter