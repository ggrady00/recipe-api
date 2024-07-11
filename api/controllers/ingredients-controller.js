const { selectAllIngredients, insertIngredient } = require("../models/ingredients-model")

exports.getIngredients = (req, res, next) => {
    selectAllIngredients()
    .then((ingredients) => {
        res.status(200).send({ingredients})
    })
}

exports.postIngredient = (req, res, next) => {
    const {name: ingredient} = req.body
    insertIngredient(ingredient)
    .then((ingredient) => {
        res.status(201).send({ingredient})
    })
    .catch(next)
}