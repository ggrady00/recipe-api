const db = require("../../db/connection");
const { insertTag } = require("./tags-models");

exports.selectAllRecipes = () => {
  const queryStr = `SELECT * FROM recipes;`;
  return db.query(queryStr).then(({ rows }) => {
    const recipeWithIngredients = rows.map((recipe) => {
      return this.selectIngredientsByID(recipe.id)
        .then((ingredients) => {
          recipe.ingredients = ingredients;
          return this.selectTagsByID(recipe.id);
        })
        .then((tags) => {
          recipe.tags = tags;
          return recipe;
        });
    });
    return Promise.all(recipeWithIngredients);
  });
};

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
      return recipe;
    });
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

exports.insertRecipe = (body) => {
  const ingredients = body.ingredients;
  const tags = body.tags;

  if (!ingredients) return Promise.reject({ status: 400, msg: "Bad Request" });
  for (let ingredient of ingredients) {
    if (!ingredient.id || !ingredient.quantity) {
      return Promise.reject({ status: 400, msg: "Bad Request" });
    }
  }

  const queryStr = `INSERT INTO recipes (name, description, instructions)
                      VALUES ($1, $2, $3)
                      RETURNING id;`;
  return db
    .query(queryStr, [body.name, body.description, body.instructions])
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
