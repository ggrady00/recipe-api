const { getAllTags, postTag } = require('../controllers/tags-controllers')

const tagsRouter = require('express').Router()

tagsRouter
.route('/')
.get(getAllTags)
.post(postTag)

module.exports = tagsRouter