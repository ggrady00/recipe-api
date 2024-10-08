const express = require("express")
const {handleCustomErrors, handlePsqlErrors, handle404Errors} = require("./errors")

const apiRouter = require("../api/routes/api-router")

const app = express()
app.use(express.json())

app.get("/", ((req, res) => {return res.status(200).send("Recipe API")}))

app.use("/api", apiRouter)

app.all("*", handle404Errors)
app.use(handleCustomErrors)
app.use(handlePsqlErrors)


module.exports = app