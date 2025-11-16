const { getShoppingList, postShoppingList, patchShoppingListById, deleteShoppingListItemById } = require("../controllers/shopping-list-controllers");
const { authenticateToken } = require("../middleware/auth")


const shoppingListRouter = require("express").Router()

shoppingListRouter
.route("/")
.get(authenticateToken, getShoppingList)
.post(authenticateToken, postShoppingList)

shoppingListRouter
.route("/:id")
.patch(authenticateToken, patchShoppingListById)
.delete(authenticateToken, deleteShoppingListItemById)



module.exports = shoppingListRouter;