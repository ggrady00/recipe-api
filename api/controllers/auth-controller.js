const { registerUser, logInUser } = require("../models/auth-model")


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
        res.status(200).send({token: 'token', user})
    })
    .catch(next)
    
}