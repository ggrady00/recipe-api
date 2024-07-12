const { getRecipes, postRecipe, getRecipeByID, patchRecipeByID } = require("../controllers/recipes-controllers")

const recipeRouter = require("express").Router()

recipeRouter
.route("/")
.get(getRecipes)
.post(postRecipe)

recipeRouter
.route("/:id")
.get(getRecipeByID)
.patch(patchRecipeByID)


module.exports = recipeRouter