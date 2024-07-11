const apiRouter = require("express").Router()
const authRouter = require("./auth-router")
const ingredientRouter = require("./ingredients-router")
const recipeRouter = require("./recipes-router")
const tagsRouter = require("./tags-router")

apiRouter.use("/auth", authRouter)
apiRouter.use("/recipes", recipeRouter)
apiRouter.use("/ingredients", ingredientRouter)
apiRouter.use("/tags", tagsRouter)

module.exports = apiRouter