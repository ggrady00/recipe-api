const { getShoppingList, postShoppingList } = require("../controllers/shopping-list-controllers");
const { authenticateToken } = require("../middleware/auth")


const shoppingListRouter = require("express").Router()

shoppingListRouter
.route("/")
.get(authenticateToken, getShoppingList)
.post(authenticateToken, postShoppingList)


module.exports = shoppingListRouter;