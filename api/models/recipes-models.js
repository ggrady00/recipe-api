const db = require("../../db/connection")

exports.selectAllRecipes = () => {
    const queryStr = `SELECT * FROM recipes;`
    return db.query(queryStr)
    .then(({rows}) => {
        const recipeWithIngredients = rows.map(recipe => {
            return this.selectIngredientsByID(recipe.id)
            .then((ingredients)=>{
                recipe.ingredients = ingredients
                return recipe
            })
        })
        return Promise.all(recipeWithIngredients)
    })
}

exports.selectIngredientsByID = (id) => {
    const queryStr = `SELECT i.name FROM recipe_ingredients ri
                      LEFT JOIN ingredients i
                      ON ri.ingredient_id = i.id
                      WHERE ri.recipe_id = $1;`
    return db.query(queryStr, [id])
    .then(({rows}) => {
        const ingredients = rows.map(row => row.name)
        return ingredients
    })
}