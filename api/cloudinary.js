const cloudinary = require("cloudinary").v2
const ENV = process.env.NODE_ENV || "development"
require("dotenv").config({
    path: `.env.${ENV}`
})

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

module.exports = cloudinary