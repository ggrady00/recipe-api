const { getAllTags } = require('../controllers/tags-controllers')

const tagsRouter = require('express').Router()

tagsRouter
.route('/')
.get(getAllTags)

module.exports = tagsRouter