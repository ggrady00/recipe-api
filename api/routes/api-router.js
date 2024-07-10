const apiRouter = require("express").Router()
const authRouter = require("./auth")
const recipeRouter = require("./recipes")

apiRouter.use("/auth", authRouter)
apiRouter.use("/recipes", recipeRouter)

module.exports = apiRouter