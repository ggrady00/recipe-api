const db = require("../../db/connection")

exports.selectRatingsByID = (id) => {
    const queryStr = `SELECT * FROM ratings
                      WHERE recipe_id = $1;`
    return db.query(queryStr, [id])
    .then(({rows}) => {
        if(!rows.length) return {ratings: []}
        const average = rows.map(rating => rating.rating).reduce((a,b) => a+b) / rows.length
        return {ratings: rows, average}
    })

}

exports.insertRatingByID = (id,user_id,rating) => {
    const queryStr = `INSERT INTO ratings (recipe_id, user_id, rating)
                      VALUES ($1, $2, $3) RETURNING *;`
    return db.query(queryStr, [id, user_id, rating])
    .then(({rows}) => {
        return rows[0]
    })
}

exports.removeRatingByID = (id, user_id) => {
    const queryStr = `DELETE FROM ratings
                      WHERE recipe_id = $1
                      AND user_id = $2`
    return db.query(queryStr, [id, user_id])
}