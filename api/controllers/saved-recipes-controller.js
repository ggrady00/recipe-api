const { selectSavedRecipes, insertSavedRecipe, removeSavedRecipe } = require("../models/saved-recipes-model")

exports.getSavedRecipes = (req, res, next) => {
    const user_id = req.user_id
    selectSavedRecipes(user_id)
    .then(savedRecipes=>{
        res.status(200).send(savedRecipes)
    })
    .catch(next)
}

exports.postSavedRecipe = (req, res, next) => {
    const user_id = req.user_id
    const {recipe_id} = req.body
    insertSavedRecipe(user_id, recipe_id)
    .then(savedRecipe => {
        res.status(201).send(savedRecipe)
    })
    .catch(next)
}

exports.deleteSavedRecipe = (req, res, next) => {
    const user_id = req.user_id
    const {recipe_id} = req.body
    removeSavedRecipe(user_id, recipe_id)
    .then(()=>{
        res.status(204).send()
    })
    .catch(next)
}