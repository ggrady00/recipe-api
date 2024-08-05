exports.handleCustomErrors = (err, req, res, next) => {
    // console.log(err)
    if (err.status) {
        res.status(err.status).send({msg: err.msg})
    } else {
        next(err)
    }
}

exports.handlePsqlErrors = (err, req, res, next) => {
    if (err.code == '23505') {
        res.status(409).send({msg: 'Already Exists'})
    } else if (err.code == '23502' || err.code == '22P02'){
        res.status(400).send({msg: 'Bad Request'})
    } else if (err.code == '23503'){
        res.status(404).send({msg: 'Recipe not Found'})
    } else {
        next(err)
    }
}

exports.handle404Errors = (req, res) => {
    res.status(404).send({msg: 'Not Found'})
}