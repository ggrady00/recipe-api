# Recipe API

This is a RESTful API backend for a recipe management website. It includes features such as creating, updating and deleting recipes as well as searching for recipes by ingredients or tags. The API is available online at https://recipe-api-kz9o.onrender.com.

## Contents
1. [Features](#features)
2. [Technologies](#technologies)
3. [Installation](#installation)
4. [Authentication](#authentication)
5. [Endpoints](#endpoints)

## Features
- **Create, update and delete recipes.**
- **Search for recipes by ingredient or tag**
- **Create user profile**
- **Create comments and ratings**
- **User authentication for restricted endpoints**

## Technologies
- **Node.js**
- **Express.js**
- **PostgreSQL**
- **pg (node-postgres)**
- **JWT (jsonwebtoken)**

## Installation
To run this API locally follow these steps:\
**Clone this repo and use `npm install` to install dependencies**\
**1. Create databases**
```bash
npm run setup-dbs
```
**2. Create environment variables**\
Create a .env.development file in the root directory.
```
PGDATABASE=recipe_website
JWT_SECRET=example-secret
```
**3. Seed the database**
```bash
npm run seed
```
**4. Start the server**
```
npm start
```
The server should be running on `http://localhost:9090`.

## Authentication

Some endpoints for this API require JWT authentication.


### User Registration
```javascript
POST /api/auth/register
```
- **Request Body:**
	```json
	{
  		"email": "user@example.com",
  		"username": "user",
  		"password": "password123"
	}
	```
- **Response:**
	```json
	{
		"user": {...},
		"token": "jwttoken"
	}
	```
This token is used to access protected endpoints. When making a request to one of these endpoints add a header ```x-auth-token``` with the value of the token.

### Login

If your token expires you will need to obtain a new one by logging back in using:
```javascript
POST /api/auth/login
```
- **Request Body:**
	```json
	{
		"username": "user",
		"password": "password123"
	}
	```
- **Response:**
	```json
	{
		"user": {...},
		"token": "jwttoken"
	}
	```


### View profile
```javascript
GET /api/auth/profile 
```
- **Response** - profile information

### Update profile info or password
```javascript
PATCH /api/auth/profile
```
- **Request Body:**
	```json
	{
		"profile_info/password": "updated_info"
	}
	```
- **Response:** - updated profile


## Endpoints

### List of all Recipes
```javascript
GET /api/recipes
```
- **Queries** - Ingredients, Tags
- **Response** - List of all recipes

### List a single recipe by recipe ID
```javascript
GET /api/recipes/:id
```
- **Response** - A Single recipe with all associated ingredients and tags

### List of all ingredients
```javascript
GET /api/ingredients
```
- **Response:**
	```json
	"ingredients": [
			{
				"id": 1,
				"name": "Spaghetti"
			},{
				...	
			}
				]
	```
### Post ingredients
```javascript
POST /api/ingredients
```
- **Request Body:**
	```json
	{
		"name": "potato"
	}
	```
- **Response:**
	```json
	{
		"ingredient": {
			"id": 23,
			"name": "potato"
		}
	}
	```
### List of all tags
```javascript
GET /api/tags
```
- **Response:**
	```json
	{
		"tags": [
			{
				"id": 1,
				"name": "Italian"
			},{
				...
			}
		]
	}
	```
### Post tags
```javascript
POST /api/tags
```
- **Request Body:**
	```json
	{
		"name": "Greek"
	}
	```
- **Response:**
	```json
	{
		"tag": {
			"id": 14,
			"name": "Greek"
		}
	}
	```
### Post a new recipe
```javascript
POST /api/recipes
```
- **Request Body:**
	```json
	{
        "name": "...",
        "description": "...",
        "instructions": "...",
        "ingredients": [
          {
            "id": 18,
            "quantity": "200g",
          },
          {
            "..."
          },
          
        ],
        "tags": [1, 2, 9]
    }
	```
- **Response** - The newly created recipe

### Updating a recipe
```javascript
PATCH /api/recipes/:id
```
- **Request Body:**
	```json
	{
		"name": "newName"
	}
	```
- **Response:**
	```json
	{
    	"name": "newName",
    	"description": "...",
    	"instructions": "...",
    	"ingredients": [
			"..."  
    		],
    	"tags": "..."
	}
	```
### Delete recipe belonging to logged in user
```javascript
DELETE /api/recipes/:id
```
### Get ratings of a recipe
```javascript
GET /api/ratings/:recipe_id
```
- **Response:**
	```json
	{
		"ratings": [
			{
				"id": 1,
				"recipe_id": 1,
				"user_id": 1,
				"rating": 5,
				"created_at": "2024-07-03T10:00:00.000Z"
			}
		],
		"average": 5
	}
	```
### Create a rating
```javascript
POST /api/ratings/:recipe_id
```
- **Request Body:**
	```json
	{
		"rating": 4
	}
	```
- **Response:**
	```json
	{
		"rating": {
			"id": 7,
			"recipe_id": 1,
			"user_id": 5,
			"rating": 4,
			"created_at": "2024-08-13T17:27:25.825Z"
		}
	}
	```
### Delete a rating
```javascript
DELETE /api/ratings/:recipe_id
```
### List of all comments for a single recipe
```javascript
GET /api/comments/:recipe_id
```
- **Response:**
	```json
	{
		"comments": [
			{
				"id": 1,
				"recipe_id": 1,
				"user_id": 1,
				"body": "Delicious recipe! Easy to follow and came out great.",
				"created_at": "2024-07-03T10:00:00.000Z"
			}
		]
	}
	```
### Create a comment
```javascript
POST /api/comments/:recipe_id
```
- **Request Body:**
	```json
	{
		"body": "new comment"
	}
	```
- **Response:**
	```json
	{
		"comment": {
			"id": 7,
			"recipe_id": 1,
			"user_id": 5,
			"body": "new comment",
			"created_at": "2024-08-13T17:33:39.579Z"
		}
	}
	```
### Delete a comment
```javascript
DELETE /api/comments/:comment_id
```
