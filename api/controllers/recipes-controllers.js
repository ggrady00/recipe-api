const { selectAllRecipes, insertRecipe, selectRecipeByID, updateRecipeByID, validateRecipeOwner, removeRecipeByID, selectRecipesByIngredients, checkExists, selectRecipesByTags } = require("../models/recipes-models")

exports.getRecipes = (req, res, next) => {
    const {ingredients, tags} = req.query
    const promises = []
    if(ingredients) promises.push(checkExists("ingredients", "name", ingredients))
    if(tags) promises.push(checkExists("tags", "name", tags))
    Promise.all(promises)
    .then(()=>{
        if(ingredients) {
            return selectRecipesByIngredients([ingredients])
        } else {
            return selectRecipesByTags([tags])
        }
    })
    .then((id) => {
        if(!id) id = 'none'
        if(ingredients || tags) return selectAllRecipes(id)
        return selectAllRecipes()
    })
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

exports.postRecipe = (req, res, next) => {
    const body = req.body
    const user_id = req.user_id
    insertRecipe(body, user_id)
    .then(recipe=>{
        res.status(201).send({recipe})
    })
    .catch(next)
}

exports.patchRecipeByID = (req, res, next) => {
    const {id} = req.params
    const user_id = req.user_id
    

    if (!Object.keys(req.body).length) return res.status(400).send({msg: 'Bad Request'})

    return validateRecipeOwner(id, user_id)
    .then(()=>{
        const promises = Object.keys(req.body).map(key => {
            return updateRecipeByID(id, key, req.body[key])
        })
        return Promise.all(promises)
    })
    .then(() => {
        return selectRecipeByID(id)
    })
    .then(recipe => {
        res.status(200).send({recipe})
    })
    .catch(next)
}

exports.deleteRecipeByID = (req, res, next) => {
    const {id} = req.params
    const user_id = req.user_id
    validateRecipeOwner(id, user_id)
    .then(()=>{
        
        return selectRecipeByID(id)
    })
    .then(()=>{

        return removeRecipeByID(id)
    })
    .then(()=>{
        res.status(204).send()
    })
    .catch(next)
}