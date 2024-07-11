const { getIngredients, postIngredient } = require("../controllers/ingredients-controller")

const ingredientRouter = require("express").Router()

ingredientRouter
.route("/")
.get(getIngredients)
.post(postIngredient)

module.exports = ingredientRouter