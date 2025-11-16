const db = require("../../db/connection");
const format = require("pg-format");

exports.selectShoppingList = (user_id) => {
  const queryStr = `SELECT sl.id, sl.user_id, i.name AS ingredient, sl.quantity, sl.added_at
                      FROM shopping_list sl
                      LEFT JOIN ingredients i
                      on sl.ingredient_id = i.id
                      WHERE user_id = $1;`;
  return db.query(queryStr, [user_id]).then(({ rows }) => {
    return { shoppingList: rows };
  });
};

exports.insertShoppingList = (user_id, body) => {
  const values = body.map((item) => [
    user_id,
    item.ingredient_id,
    item.quantity,
  ]);
  const queryStr = format(
    `INSERT into shopping_list (user_id, ingredient_id, quantity)
                      VALUES %L RETURNING *;
                      `,
    values
  );
  return db.query(queryStr).then(({ rows }) => {
    return { shoppingListItems: rows };
  });
};

exports.updateShoppingListById = (id, quantity, user_id) => {
  const checkExistQuery = `SELECT user_id FROM shopping_list WHERE id = $1`;

  return db
    .query(checkExistQuery, [id])
    .then(({ rows }) => {
      if (!rows.length)
        return Promise.reject({ status: 404, msg: "Item not Found" });
      if (rows[0].user_id !== user_id)
        return Promise.reject({
          status: 403,
          msg: "You cannot update this shopping list item",
        });
      const queryStr = `UPDATE shopping_list
                        SET quantity = $1
                        WHERE id = $2 AND user_id = $3
                        RETURNING *;`;

      return db.query(queryStr, [quantity, id, user_id]);
    })
    .then(({ rows }) => {
      return { shoppingListItem: rows[0] };
    });
};

exports.removeShoppingListItemById = (user_id, id) => {
    const checkExistQuery = `SELECT user_id FROM shopping_list WHERE id = $1`;

  return db.query(checkExistQuery, [id])
  .then(({rows}) => {
    if (!rows.length) return Promise.reject({ status: 404, msg: "Item not Found" });
    if (rows[0].user_id !== user_id) return Promise.reject({status: 403, msg: "You cannot delete this shopping list item"});
    const queryStr = `DELETE FROM shopping_list
                        WHERE user_id = $1
                        AND id = $2
                        RETURNING *;`;
  
    
    return db.query(queryStr, [user_id, id])
  })

  .then(({ rows }) => {
    return { shoppingListItem: rows[0] };
  });
};
