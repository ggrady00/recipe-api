const { selectAllTags, insertTag } = require("../models/tags-models")

exports.getAllTags = (req, res, next) => {
    selectAllTags()
    .then(tags => {
        res.status(200).send({tags})
    })
}

exports.postTag = (req, res, next) => {
    const {name: tag} = req.body
    insertTag(tag)
    .then(tag => {
        res.status(201).send({tag})
    })
    .catch(next)
}