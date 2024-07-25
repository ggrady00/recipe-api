const apiRouter = require("express").Router()
const authRouter = require("./auth-router")
const commentsRouter = require("./comments-router")
const ingredientRouter = require("./ingredients-router")
const ratingsRouter = require("./ratings-router")
const recipeRouter = require("./recipes-router")
const tagsRouter = require("./tags-router")

apiRouter.use("/auth", authRouter)
apiRouter.use("/recipes", recipeRouter)
apiRouter.use("/ingredients", ingredientRouter)
apiRouter.use("/tags", tagsRouter)
apiRouter.use("/ratings", ratingsRouter)
apiRouter.use("/comments", commentsRouter)

module.exports = apiRouter