const db = require("../../db/connection")

exports.selectCommentsByID = (id) => {
    const queryStr = `SELECT * FROM comments
                      WHERE recipe_id = $1;`

    return db.query(queryStr, [id])
    .then(({rows}) => {
        return rows
    })
}

exports.insertCommentByID = (id, user_id, body) => {
    console.log(id, user_id, body)
    const queryStr = `INSERT INTO comments (recipe_id, user_id, body)
                      VALUES ($1, $2, $3)
                      RETURNING *`
    return db.query(queryStr, [id, user_id, body])
    .then(({rows}) => {
        return rows[0]
    })
}

exports.selectCommentByCommentID = (id, user_id) => {
    return db.query(`SELECT * FROM comments WHERE id = $1;`, [id])
    .then(({rows}) => {
        if(!rows.length) return Promise.reject({status:404, msg: "Comment not Found"})
        if(rows[0].user_id !== user_id) return Promise.reject({status:401, msg: "You cannot delete this comment"})
        return rows[0]
    })
}

exports.deleteCommentByCommentID = (id) => {
    const queryStr = `DELETE FROM comments
                      WHERE id = $1;`
    return db.query(queryStr, [id])
    
}