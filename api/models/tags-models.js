const db = require("../../db/connection")

exports.selectAllTags = () => {
    const queryStr = `SELECT * FROM tags;`
    return db.query(queryStr)
    .then(({rows}) => {
        return rows
    })
}