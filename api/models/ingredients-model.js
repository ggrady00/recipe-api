const db = require("../../db/connection")

exports.selectAllIngredients = () => {
    const queryStr = `SELECT * FROM ingredients;`
    return db.query(queryStr)
    .then(({rows}) => {
        return rows
    })
}

exports.insertIngredient = (ingredient) => {
    if(typeof ingredient !== 'string' || !ingredient.length) return Promise.reject({status:400, msg: 'Bad Request'})
    const queryStr = `INSERT into ingredients (name)
                      VALUES ($1) 
                      RETURNING *`
    return db.query(queryStr, [ingredient])
    .then(({rows}) => {
        return rows[0]
    })
}