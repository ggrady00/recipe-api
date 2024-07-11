const apiRouter = require("express").Router()
const authRouter = require("./auth")
const ingredientRouter = require("./ingredients")
const recipeRouter = require("./recipes")

apiRouter.use("/auth", authRouter)
apiRouter.use("/recipes", recipeRouter)
apiRouter.use("/ingredients", ingredientRouter)

module.exports = apiRouter