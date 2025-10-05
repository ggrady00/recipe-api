const db = require("../../db/connection")

exports.selectSavedRecipes = (user_id) => {
    const queryStr = `SELECT * FROM saved_recipes
                      WHERE user_id = $1;`
    return db.query(queryStr, [user_id])
    .then(({rows}) => {
        return {savedRecipes : rows}
    })
}

exports.insertSavedRecipe = (user_id, recipe_id) => {
    const queryStr = `INSERT INTO saved_recipes (user_id, recipe_id)
                      VALUES ($1, $2) RETURNING *;`
    return db.query(queryStr, [user_id, recipe_id])
    .then(({rows}) => {
        return {savedRecipe : rows[0]}
    })
}

exports.removeSavedRecipe = (user_id, recipe_id) => {
    const queryStr = `DELETE FROM saved_recipes
                      WHERE user_id = $1
                      AND recipe_id = $2
                      RETURNING *;`
    return db.query(queryStr, [user_id, recipe_id])
    .then(({rows}) => {
        if(rows.length === 0)
        return Promise.reject({status: 404, msg: 'Saved Recipe not Found'})
    })
}