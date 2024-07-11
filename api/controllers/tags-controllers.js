const { selectAllTags } = require("../models/tags-models")

exports.getAllTags = (req, res, next) => {
    selectAllTags()
    .then(tags => {
        res.status(200).send({tags})
    })
}