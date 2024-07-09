const { registerUser, logInUser, selectProfile } = require("../models/auth-model")
const jwt = require("jsonwebtoken")


exports.postNewUser = (req, res, next) => {
    const {username, email, password} = req.body
    registerUser(username, email, password)
    .then((newUser) => {
        res.status(201).send({token: 'token', user: newUser})
    })
    .catch(next)
}

exports.postLoginIn = (req, res, next) => {
    const {username, password} = req.body
    logInUser(username, password)
    .then((user)=>{
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '1h'})
        res.status(200).send({token: token, user})
    })
    .catch(next)
    
}

exports.getProfile = (req, res, next) => {
    selectProfile()
    .then(profile => {
        res.status(200).send({profile})
    })
    .catch(next)
}