const { getRatingsByID, postRatingByID, deleteRatingByID, getRatings } = require("../controllers/ratings-controllers")
const { authenticateToken } = require("../middleware/auth")

const ratingsRouter = require("express").Router()

ratingsRouter
.route("/:id")
.get(getRatingsByID)
.post(authenticateToken, postRatingByID)
.delete(authenticateToken, deleteRatingByID)

ratingsRouter
.route("/")
.get(getRatings)


module.exports = ratingsRouter