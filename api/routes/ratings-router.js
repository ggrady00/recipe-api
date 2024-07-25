const { getRatingsByID, postRatingByID, deleteRatingByID } = require("../controllers/ratings-controllers")
const { authenticateToken } = require("../middleware/auth")

const ratingsRouter = require("express").Router()

ratingsRouter
.route("/:id")
.get(getRatingsByID)
.post(authenticateToken, postRatingByID)
.delete(authenticateToken, deleteRatingByID)


module.exports = ratingsRouter