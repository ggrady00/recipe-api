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
    const queryStr = `SELECT i.name as ingredient, ri.quantity FROM recipe_ingredients ri
                      LEFT JOIN ingredients i
                      ON ri.ingredient_id = i.id
                      WHERE ri.recipe_id = $1;`
    return db.query(queryStr, [id])
    .then(({rows}) => {
        return rows
    })
}

exports.selectRecipeByID = (id) => {
    const queryStr = `SELECT * FROM recipes WHERE id = $1`
    return db.query(queryStr, [id])
    .then(({rows}) => {
        if(!rows.length) return Promise.reject({status: 404, msg: "Recipe not Found"})
        recipe = rows[0]
        return this.selectIngredientsByID(recipe.id)
    })
    .then(ingredients => {
        recipe.ingredients = ingredients
        return recipe
    })
}

// exports.insertRecipe = (body) => {
//     const ingredients = body.ingredients
//     const queryStr = `INSERT INTO recipes (name, description, ingredients)`
// }