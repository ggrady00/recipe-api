const db = require("../../db/connection")
const format = require("pg-format")

exports.selectShoppingList = (user_id) => {
    const queryStr = `SELECT sl.id, sl.user_id, i.name AS ingredient, sl.quantity, sl.added_at
                      FROM shopping_list sl
                      LEFT JOIN ingredients i
                      on sl.ingredient_id = i.id
                      WHERE user_id = $1;`
    return db.query(queryStr, [user_id])
    .then(({rows}) => {
        return {shoppingList: rows}
    })
}

exports.insertShoppingList = (user_id, body) => {
    const values =  body.map(item => [user_id, item.ingredient_id, item.quantity])
    const queryStr = format(`INSERT into shopping_list (user_id, ingredient_id, quantity)
                      VALUES %L RETURNING *;
                      `, values)
    return db.query(queryStr)
    .then(({rows}) => {
        
        return {shoppingListItems: rows}
    })
}