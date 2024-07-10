const { getRecipes, postRecipe, getRecipeByID } = require("../controllers/recipes-controllers")

const recipeRouter = require("express").Router()

recipeRouter
.route("/")
.get(getRecipes)
// .post(postRecipe)

recipeRouter
.route("/:id")
.get(getRecipeByID)


module.exports = recipeRouter