const { postNewUser, postLoginIn, getProfile, patchProfile } = require("../controllers/auth-controller")
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
.patch(authenticateToken, patchProfile)

module.exports = authRouter