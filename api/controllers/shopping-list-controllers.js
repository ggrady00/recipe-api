const { selectShoppingList, insertShoppingList } = require("../models/shopping-list-models")

exports.getShoppingList = (req, res, next) => {
    const user_id = req.user_id
    selectShoppingList(user_id)
    .then((shoppingList) => {
        res.status(200).send(shoppingList)
    })
}

exports.postShoppingList = (req, res, next) => {
    const user_id = req.user_id
    if (!Array.isArray(req.body) || req.body.length === 0 || req.body.some(item =>  !item.quantity || typeof item.quantity !== "string" || item.quantity.length === 0)) {
        return res.status(400).send({ msg: "Bad Request" });
      }
    
    insertShoppingList(user_id, req.body)
    .then(shoppingListItems => {
        res.status(201).send(shoppingListItems)
    })
    .catch(next)
}