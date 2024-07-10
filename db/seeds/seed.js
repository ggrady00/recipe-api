const db = require("../connection")
const format = require('pg-format');
const bcrypt = require("bcryptjs");
const hashPasswords = require("./utils");

const seed = ({tagsData, recipesData, usersData, ingredientsData, commentsData, ratingsData, recipeTagsData, recipeIngredientsData}) => {
    return db.query('DROP TABLE IF EXISTS recipe_ingredients;')
    .then(()=>{
        return db.query('DROP TABLE IF EXISTS recipe_tags;')
    })
    .then(()=>{
        return db.query('DROP TABLE IF EXISTS ratings;')
    })
    .then(()=>{
        return db.query('DROP TABLE IF EXISTS comments;')
    })
    .then(()=>{
        return db.query('DROP TABLE IF EXISTS ingredients;')
    })
    .then(()=>{
        return db.query('DROP TABLE IF EXISTS tags;')
    })
    .then(()=>{
        return db.query('DROP TABLE IF EXISTS recipes;')
    })
    .then(()=>{
        return db.query('DROP TABLE IF EXISTS users;')
    })
    .then(()=>{
        const tagsTablePromise = db.query(`
        CREATE TABLE tags (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL
        );`)

        const usersTablePromise = db.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(30) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL,
            profile_info VARCHAR(100)
        );`)
        const recipesTablePromise =db.query(`
        CREATE TABLE recipes (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            description VARCHAR(100),
            instructions VARCHAR,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP
        );`)

        const ingredientsTablePromise = db.query(`
        CREATE TABLE ingredients (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL
        );`)
        return Promise.all([tagsTablePromise, usersTablePromise, recipesTablePromise, ingredientsTablePromise])
    })
    .then(()=>{
        return db.query(`
        CREATE TABLE comments (
            id SERIAL PRIMARY KEY,
            recipe_id INT REFERENCES recipes(id),
            user_id INT REFERENCES users(id),
            body VARCHAR,
            created_at TIMESTAMP DEFAULT NOW()
        );`)
    })
    .then(()=>{
        return db.query(`
        CREATE TABLE ratings (
            id SERIAL PRIMARY KEY,
            recipe_id INT REFERENCES recipes(id),
            user_id INT REFERENCES users(id),
            rating INT,
            created_at TIMESTAMP DEFAULT NOW()
        );`)
    })
    .then(()=>{
        return db.query(`
        CREATE TABLE recipe_ingredients (
            id SERIAL PRIMARY KEY,
            recipe_id INT REFERENCES recipes(id),
            ingredient_id INT REFERENCES ingredients(id)
        );`)
    })
    
    .then(()=>{
        return db.query(`
        CREATE TABLE recipe_tags (
            id SERIAL PRIMARY KEY,
            recipe_id INT REFERENCES recipes(id),
            tag_id INT REFERENCES tags(id)
        );`)
    })
    .then(()=>{
        return hashPasswords(usersData)
    })
    .then((usersData)=>{
        const insertTagsQueryStr = format(
            `INSERT INTO tags (name) VALUES %L;`,
            tagsData.map(({name}) => [name])
        )
        const tagsPromise = db.query(insertTagsQueryStr)

        const insertUsersQueryStr = format(
            `INSERT INTO users (username, email, password, profile_info) VALUES %L;`,
            usersData.map(({username, email, password, profile_info}) => [username, email, password, profile_info])
        )
        const usersPromise = db.query(insertUsersQueryStr)

        const insertIngredientsQueryStr = format(
            `INSERT INTO ingredients (name) VALUES %L;`,
            ingredientsData.map(({name}) => [name])
        )
        const ingredientsPromise = db.query(insertIngredientsQueryStr)

        const insertRecipesQueryStr = format(
            `INSERT INTO recipes (name, description, instructions) VALUES %L;`,
            recipesData.map(({name, description, instructions}) => [name, description, instructions])
        )
        const recipesPromise = db.query(insertRecipesQueryStr)
        return Promise.all([tagsPromise, usersPromise, recipesPromise, ingredientsPromise])
    })
    .then(()=>{
        const insertCommentsQueryStr = format(
            `INSERT INTO comments (recipe_id, user_id, body, created_at) VALUES %L;`,
            commentsData.map(({recipe_id, user_id, body, created_at}) => [recipe_id, user_id, body, created_at])
        )
        const commentsPromise = db.query(insertCommentsQueryStr)

        const insertRatingsQueryStr = format(
            `INSERT INTO ratings (recipe_id, user_id, rating, created_at) VALUES %L;`,
            ratingsData.map(({recipe_id, user_id, rating, created_at}) => [recipe_id, user_id, rating, created_at])
        )
        const ratingsPromise = db.query(insertRatingsQueryStr)

        const insertRecipeIngredientsQueryStr = format(
            `INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES %L;`,
            recipeIngredientsData.map(({recipe_id, ingredient_id}) => [recipe_id, ingredient_id])
        )
        const recipeIngredientsPromise = db.query(insertRecipeIngredientsQueryStr)

        const insertRecipeTagsQueryStr = format(
            `INSERT INTO recipe_tags (recipe_id, tag_id) VALUES %L;`,
            recipeTagsData.map(({recipe_id, tag_id}) => [recipe_id, tag_id,])
        )
        const recipeTagsPromise = db.query(insertRecipeTagsQueryStr)

        return Promise.all([commentsPromise, ratingsPromise, recipeIngredientsPromise, recipeTagsPromise])
    })
}

module.exports = seed