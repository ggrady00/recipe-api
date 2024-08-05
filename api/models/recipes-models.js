const format = require("pg-format");
const db = require("../../db/connection");
const { insertTag } = require("./tags-models");

exports.selectAllRecipes = (id) => {
  let queryStr = `SELECT * FROM recipes`;
  if(id == 'none') return []
  if(id) {
    queryStr += ` WHERE id IN %L`
    queryStr = format(queryStr, [id])
  }
  return db.query(queryStr).then(({ rows }) => {
    const recipeWithIngredients = rows.map((recipe) => {
      return this.selectIngredientsByID(recipe.id)
        .then((ingredients) => {
          recipe.ingredients = ingredients;
          return this.selectTagsByID(recipe.id);
        })
        .then((tags) => {
          recipe.tags = tags;
          return this.selectUserByID(recipe.created_by)
        })
        .then((user) => {
          recipe.created_by = user
          return recipe
        })
    });
    return Promise.all(recipeWithIngredients);
  });
};
 exports.checkExists = (table, column, value) => {
    const queryStr = format(`SELECT * FROM %I WHERE %I ILIKE $1;`, table, column)
    return db.query(queryStr, [value])
    .then(({rows}) => {
        if (!rows.length) {
            return Promise.reject({status: 404, msg: "Resource not Found"})
        } else {
            return rows[0]
        }
    })
}

exports.selectRecipesByIngredients = (ingredients) => {
  const queryStr = `SELECT ri.recipe_id 
                    FROM recipe_ingredients ri 
                    LEFT JOIN ingredients i 
                    ON i.id = ri.ingredient_id 
                    WHERE i.name ILIKE $1;`
  return db.query(queryStr, ingredients)
  .then(({rows}) => {
    if (!rows.length) return
    else {
      return rows.map(recipe => recipe.recipe_id)
    }
  })
}

exports.selectRecipesByTags = (tags) => {
  const queryStr = `SELECT rt.recipe_id 
                    FROM recipe_tags rt
                    LEFT JOIN tags t
                    ON t.id = rt.tag_id 
                    WHERE t.name ILIKE $1;`
  return db.query(queryStr, tags)
  .then(({rows}) => {
    if (!rows.length) return
    else {
      return rows.map(recipe => recipe.recipe_id)
    }
  })
}

exports.selectIngredientsByID = (id) => {
  const queryStr = `SELECT i.name as ingredient, ri.quantity FROM recipe_ingredients ri
                      LEFT JOIN ingredients i
                      ON ri.ingredient_id = i.id
                      WHERE ri.recipe_id = $1;`;
  return db.query(queryStr, [id]).then(({ rows }) => {
    return rows;
  });
};

exports.selectTagsByID = (id) => {
  const queryStr = `SELECT t.name FROM recipe_tags rt
                      LEFT JOIN tags t
                      ON rt.tag_id = t.id
                      WHERE rt.recipe_id = $1;`;
  return db.query(queryStr, [id]).then(({ rows }) => {
    return rows.map((row) => row.name);
  });
};

exports.selectUserByID = (id) => {
  const queryStr = `SELECT username FROM users
                      WHERE id = $1;`;
  return db.query(queryStr, [id]).then(({ rows }) => {
    return rows[0].username
  });
};

exports.selectRecipeByID = (id) => {
  const queryStr = `SELECT * FROM recipes WHERE id = $1`;
  return db
    .query(queryStr, [id])
    .then(({ rows }) => {
      if (!rows.length)
        return Promise.reject({ status: 404, msg: "Recipe not Found" });
      recipe = rows[0];
      return this.selectIngredientsByID(recipe.id);
    })
    .then((ingredients) => {
      recipe.ingredients = ingredients;
      return this.selectTagsByID(recipe.id);
    })
    .then((tags) => {
      recipe.tags = tags;
      return this.selectUserByID(recipe.created_by)
    })
    .then((user) => {
      recipe.created_by = user
      return recipe
    })
};

exports.insertTag = (id, tag) => {
  const tagQueryStr = `INSERT INTO recipe_tags (recipe_id, tag_id)
                             VALUES ($1, $2);`;
  return db.query(tagQueryStr, [id, tag]);
};

exports.insertIngredient = (recipe_id, ing_id, quantity) => {
    const ingredientQueryStr = `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
                                    VALUES ($1, $2, $3);`;
      
        return db.query(ingredientQueryStr, [
          recipe_id,
          ing_id,
          quantity,
        ])
}

exports.insertRecipe = (body, user_id) => {
  const ingredients = body.ingredients;
  const tags = body.tags;

  if (!ingredients) return Promise.reject({ status: 400, msg: "Bad Request" });
  for (let ingredient of ingredients) {
    if (!ingredient.id || !ingredient.quantity) {
      return Promise.reject({ status: 400, msg: "Bad Request" });
    }
  }

  const queryStr = `INSERT INTO recipes (name, description, instructions, created_by)
                      VALUES ($1, $2, $3, $4)
                      RETURNING id;`;
  return db
    .query(queryStr, [body.name, body.description, body.instructions, user_id])
    .then(({ rows }) => {
      id = rows[0].id;
      const promises = ingredients.map(ingredient => this.insertIngredient(id, ingredient.id, ingredient.quantity))
      return Promise.all(promises)
    })
    .then(() => {
      if (!tags || !tags.length) return;
      const promises = tags.map(tag => this.insertTag(id, tag))
      return Promise.all(promises)
    })
    .then(() => {
      return this.selectRecipeByID(id);
    })
    .then((recipe) => {
      return recipe;
    });
};


exports.updateRecipeByID = (id, property, updatedValue) => {
  let queryStr = `UPDATE recipes
                  SET updated_at = NOW()`

  if(property === 'name' || property === 'description' ||property === 'instructions') {
    queryStr += `, %I = %L`

    queryStr = format(queryStr, property, updatedValue)
    queryStr += ` WHERE id = $1`
    return db.query(queryStr, [id])

  } else if (property === 'ingredients') {
    queryStr += ` WHERE id = $1`

    return db.query(`DELETE FROM recipe_ingredients WHERE recipe_id = $1`, [id])
    .then(()=> {
      const promises = updatedValue.map(x => this.insertIngredient(id, x.id, x.quantity))
      return Promise.all(promises, db.query(queryStr, [id]))
    })

  } else if (property === 'tags') {

    queryStr += ` WHERE id = $1`

    return db.query(`DELETE FROM recipe_tags WHERE recipe_id = $1`, [id])
    .then(()=> {
      const promises = updatedValue.map(tag => this.insertTag(id, tag))
      return Promise.all(promises, db.query(queryStr, [id]))
    })
    
  } else {
    return Promise.reject({status: 400, msg: 'Bad Request'})
  }

}


exports.validateRecipeOwner = (recipe_id, user_id) => {
  return db.query(`SELECT created_by FROM recipes WHERE id = $1`, [recipe_id])
  .then(({rows}) => {
    if(!rows.length) return Promise.reject({status:404, msg: 'Not Found'})
    if (rows[0].created_by !== user_id) {
      return Promise.reject({status:400, msg: 'You cannot update this recipe'})
    }
  })
}

exports.removeRecipeByID = (recipe_id) => {
  return db.query(`DELETE FROM recipe_ingredients WHERE recipe_id = $1`, [recipe_id])
  .then(()=>{
    return db.query(`DELETE FROM recipe_tags WHERE recipe_id = $1`, [recipe_id])
  })
  .then(()=>{
    return db.query(`DELETE FROM comments WHERE recipe_id = $1`, [recipe_id])
  })
  .then(()=>{
    return db.query(`DELETE FROM ratings WHERE recipe_id = $1`, [recipe_id])
  })
  .then(()=>{
    return db.query(`DELETE FROM recipes WHERE id = $1`, [recipe_id])
  })
}