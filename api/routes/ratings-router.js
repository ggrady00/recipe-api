const { getRatingsByID, postRatingByID } = require("../controllers/ratings-controllers")
const { authenticateToken } = require("../middleware/auth")

const ratingsRouter = require("express").Router()

ratingsRouter
.route("/:id")
.get(getRatingsByID)
.post(authenticateToken, postRatingByID)


module.exports = ratingsRouter