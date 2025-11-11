const { selectCommentsByID, insertCommentByID, deleteCommentByCommentID, selectCommentByCommentID } = require("../models/comments-models")
const { selectRecipeByID, selectAllRecipes } = require("../models/recipes-models")

exports.getCommentsByID = (req, res, next) => {
    const {id} = req.params
    selectRecipeByID(id)
    .then(()=>{
        return selectCommentsByID(id)
    })
    .then(comments => {
        res.status(200).send({comments})
    })
    .catch(next)
}

exports.postCommentByID = (req, res, next) => {
    const {id} = req.params
    const user_id = req.user_id
    const {body} = req.body
    insertCommentByID(id, user_id, body)
    .then(comment => {
        res.status(201).send({comment})
    })
    .catch(next)
}

exports.removeCommentByCommentID = (req, res, next) => {
    const {id} = req.params
    const user_id = req.user_id
    selectCommentByCommentID(id, user_id)
    .then((comment) => {
        return deleteCommentByCommentID(id)
    })
    .then(()=>{
        res.status(204).send()
    })
    .catch(next)
}

exports.getComments = (req, res, next) => {
    selectAllRecipes()
    .then((body) =>  {
        const ids = body.map(recipe => recipe.id)
        const promises = []
        ids.forEach(id => {
            promises.push(selectCommentsByID(id))
        })
        return Promise.all(promises)
    })
    .then(recipes => {
        const comments = recipes.map(recipe => {
            const id = recipe[0] ? recipe[0].recipe_id : null
            return {
                comments: recipe,
                id: id
            }
            
        })
        const filtered = comments.filter(recipe => recipe.id)
        return filtered
    })
    .then(comments => {
        res.status(200).send({comments})
    })
    .catch(next)
}