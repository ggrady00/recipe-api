const { selectShoppingList, insertShoppingList, updateShoppingListById, removeShoppingListItemById } = require("../models/shopping-list-models")

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

exports.patchShoppingListById = (req, res, next) => {
    const user_id = req.user_id
    const {id} = req.params
    const {quantity} = req.body
    if (!quantity || typeof quantity !== "string" || quantity === "") return res.status(400).send({msg: 'Bad Request'})


    updateShoppingListById(id, quantity, user_id)
    .then(shoppingListItem => {
        res.status(200).send(shoppingListItem)
    })
    .catch(next)
}

exports.deleteShoppingListItemById = (req, res, next) => {
    const user_id = req.user_id
    const {id} = req.params
    removeShoppingListItemById(user_id, id)
    .then(shoppingListItem => {
        res.status(204).send(shoppingListItem)
    })
    .catch(next)
}