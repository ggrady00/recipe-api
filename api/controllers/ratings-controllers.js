const { selectRatingsByID, insertRatingByID } = require("../models/ratings-models")

exports.getRatingsByID = (req, res, next) => {
    const {id} = req.params
    selectRatingsByID(id)
    .then(ratings => {
        res.status(200).send(ratings)
    })
    .catch(next)
}

exports.postRatingByID = (req, res, next) => {
    const {id} = req.params
    const {rating} = req.body
    const user_id = req.user_id
    selectRatingsByID(id)
    .then((data) => {
        const exists = data.ratings.filter(rating => rating.user_id == user_id)
        if(exists.length) return res.status(409).send({msg: 'Already Exists'})
        return insertRatingByID(id,user_id, rating)
    })
    .then((rating) => {
        res.status(201).send({rating})
    })
    .catch(next)
}