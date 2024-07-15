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
            name VARCHAR(50) UNIQUE NOT NULL
        );`)

        const usersTablePromise = db.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(30) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL,
            profile_info VARCHAR(100)
        );`)
        

        const ingredientsTablePromise = db.query(`
        CREATE TABLE ingredients (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL
        );`)
        return Promise.all([tagsTablePromise, usersTablePromise, ingredientsTablePromise])
    })
    .then(()=>{
        return db.query(`
        CREATE TABLE recipes (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            description VARCHAR(100),
            instructions VARCHAR NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            created_by INT references users(id),
            updated_at TIMESTAMP
        );`)
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
            ingredient_id INT REFERENCES ingredients(id),
            quantity VARCHAR(50)
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

        return Promise.all([tagsPromise, usersPromise, ingredientsPromise])
    })
    .then(()=>{
        const insertRecipesQueryStr = format(
            `INSERT INTO recipes (name, description, instructions, created_by) VALUES %L;`,
            recipesData.map(({name, description, instructions, created_by}) => [name, description, instructions, created_by])
        )
        return db.query(insertRecipesQueryStr)
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
            `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES %L;`,
            recipeIngredientsData.map(({recipe_id, ingredient_id, quantity}) => [recipe_id, ingredient_id, quantity])
        )
        // console.log(insertRecipeIngredientsQueryStr)
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