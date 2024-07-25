const { selectRatingsByID, insertRatingByID, removeRatingByID } = require("../models/ratings-models")
const { checkExists, selectRecipeByID } = require("../models/recipes-models")

exports.getRatingsByID = (req, res, next) => {
    const {id} = req.params
    selectRecipeByID(id)
    .then((data)=>{
        return selectRatingsByID(id)
    })
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

exports.deleteRatingByID = (req, res, next) => {
    const {id} = req.params
    const user_id = req.user_id
    selectRecipeByID(id)
    .then(()=>{

        return selectRatingsByID(id)
    })
    .then(({ratings})=>{
        const users = ratings.map(rating => rating.user_id)
        if(!users.includes(user_id)) return res.status(404).send({msg: 'Rating not Found'})
        return removeRatingByID(id, user_id)
    })
    .then(()=>{
        res.status(204).send()
    })
    .catch(next)
}