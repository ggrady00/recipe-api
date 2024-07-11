const db = require("../../db/connection")

exports.selectAllIngredients = () => {
    const queryStr = `SELECT * FROM ingredients;`
    return db.query(queryStr)
    .then(({rows}) => {
        return rows
    })
}