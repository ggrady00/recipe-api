const { selectAllRecipes, insertRecipe, selectRecipeByID } = require("../models/recipes-models")

exports.getRecipes = (req, res, next) => {
    selectAllRecipes()
    .then((recipes) => {
        res.status(200).send({recipes})
    })
    .catch(next)
}

exports.getRecipeByID = (req, res, next) => {
    const {id} = req.params
    selectRecipeByID(id)
    .then(recipe => {
        res.status(200).send({recipe})
    })
    .catch(next)
}

// exports.postRecipe = (req, res, next) => {
//     const body = req.body
//     insertRecipe(body)
// }