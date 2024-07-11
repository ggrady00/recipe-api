const db = require("../../db/connection")

exports.selectAllTags = () => {
    const queryStr = `SELECT * FROM tags;`
    return db.query(queryStr)
    .then(({rows}) => {
        return rows
    })
}

exports.insertTag = (tag) => {
    if(typeof tag !== 'string' || !tag.length) return Promise.reject({status:400, msg: 'Bad Request'})
    const queryStr = `INSERT into tags (name)
                      VALUES ($1)
                      RETURNING *`
    return db.query(queryStr, [tag])
    .then(({rows}) => {
        return rows[0]
    })
}