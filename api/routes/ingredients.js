const { getIngredients } = require("../controllers/ingredients-controller")

const ingredientRouter = require("express").Router()

ingredientRouter
.route("/")
.get(getIngredients)

module.exports = ingredientRouter