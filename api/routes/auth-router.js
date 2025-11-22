const { postNewUser, postLoginIn, getProfile, patchProfile } = require("../controllers/auth-controller")
const { authenticateToken } = require("../middleware/auth")

const multer = require("multer")

const upload = multer({storage: multer.memoryStorage()})

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
.patch(authenticateToken, upload.single("profile_pic"), patchProfile)

module.exports = authRouter