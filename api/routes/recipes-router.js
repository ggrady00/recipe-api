const { getRecipes, postRecipe, getRecipeByID, patchRecipeByID, deleteRecipeByID } = require("../controllers/recipes-controllers")
const { authenticateToken } = require("../middleware/auth")

const multer = require("multer")

const upload = multer({storage: multer.memoryStorage()})

const recipeRouter = require("express").Router()

recipeRouter
.route("/")
.get(getRecipes)
.post(authenticateToken , upload.single("recipe_pic"), postRecipe)

recipeRouter
.route("/:id")
.get(getRecipeByID)
.patch(authenticateToken, patchRecipeByID)
.delete(authenticateToken, deleteRecipeByID)




module.exports = recipeRouter