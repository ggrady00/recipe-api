const { selectAllRecipes, selectIngredientsByID } = require("../models/recipes-models")

exports.getRecipes = (req, res, next) => {
    selectAllRecipes()
    .then((recipes) => {
        res.status(200).send({recipes})
    })
}