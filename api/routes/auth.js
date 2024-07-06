const { postNewUser, postLoginIn } = require("../controllers/auth-controller")



const authRouter = require("express").Router()

authRouter
.route("/register")
.post(postNewUser)

authRouter
.route("/login")
.post(postLoginIn)

module.exports = authRouter