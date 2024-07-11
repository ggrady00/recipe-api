const apiRouter = require("express").Router()
const authRouter = require("./auth-router")
const ingredientRouter = require("./ingredients-router")
const recipeRouter = require("./recipes-router")

apiRouter.use("/auth", authRouter)
apiRouter.use("/recipes", recipeRouter)
apiRouter.use("/ingredients", ingredientRouter)

module.exports = apiRouter