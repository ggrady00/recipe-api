const { selectAllIngredients } = require("../models/ingredients-model")

exports.getIngredients = (req, res, next) => {
    selectAllIngredients()
    .then((ingredients) => {
        // console.log(ingredients)
        res.status(200).send({ingredients})
    })
}