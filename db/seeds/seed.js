const db = require("../connection")

const seed = () => {
    return db.query('DROP TABLE IF EXISTS recipe_ingredients;')
    .then(()=>{
        return db.query('DROP TABLE IF EXISTS ingredients;')
    })
    .then(()=>{
        return db.query('DROP TABLE IF EXISTS ratings;')
    })
    .then(()=>{
        return db.query('DROP TABLE IF EXISTS comments;')
    })
    .then(()=>{
        return db.query('DROP TABLE IF EXISTS recipes;')
    })
    .then(()=>{
        return db.query('DROP TABLE IF EXISTS users;')
    })
    .then(()=>{
        return db.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(30) NOT NULL,
            password VARCHAR(20) NOT NULL,
            profile_info VARCHAR(100)
        );`)
    })
    .then(()=>{
        return db.query(`
        CREATE TABLE recipes (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            description VARCHAR(100),
            instructions VARCHAR,
            create_at TIMESTAMP DEFAULT NOW(),
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
            create_at TIMESTAMP DEFAULT NOW()
        );`)
    })
    .then(()=>{
        return db.query(`
        CREATE TABLE ratings (
            id SERIAL PRIMARY KEY,
            recipe_id INT REFERENCES recipes(id),
            user_id INT REFERENCES users(id),
            rating INT,
            create_at TIMESTAMP DEFAULT NOW()
        );`)
    })
    .then(()=>{
        return db.query(`
        CREATE TABLE ingredients (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL
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
        CREATE TABLE tags (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL
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
}

module.exports = seed