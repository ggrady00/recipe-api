const { getRecipes } = require("../controllers/recipes-controllers")

const recipeRouter = require("express").Router()

recipeRouter
.route("/")
.get(getRecipes)


module.exports = recipeRouter