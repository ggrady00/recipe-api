const { selectCommentsByID, insertCommentByID, deleteCommentByCommentID, selectCommentByCommentID } = require("../models/comments-models")
const { selectRecipeByID } = require("../models/recipes-models")

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