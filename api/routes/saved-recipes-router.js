const { getSavedRecipes, postSavedRecipe, deleteSavedRecipe } = require("../controllers/saved-recipes-controller");
const { authenticateToken } = require("../middleware/auth")

const savedRecipesRouter = require("express").Router()

savedRecipesRouter
.route("/")
.get(authenticateToken, getSavedRecipes)
.post(authenticateToken, postSavedRecipe)
.delete(authenticateToken, deleteSavedRecipe)

module.exports = savedRecipesRouter;