const db = require("../../db/connection")

exports.selectRatingsByID = (id) => {
    const queryStr = `SELECT * FROM ratings
                      WHERE recipe_id = $1;`
    return db.query(queryStr, [id])
    .then(({rows}) => {
        if(!rows.length) return Promise.reject({status:404, msg: "Recipe not Found"})
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