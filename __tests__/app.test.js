const app = require("../api/app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const {
  tagsData,
  ingredientsData,
  usersData,
  recipesData,
  commentsData,
  ratingsData,
  recipeTagsData,
  recipeIngredientsData,
  savedRecipesData,
} = require("../db/data/test-data/index");
const ratings = require("../db/data/test-data/ratings");

beforeEach(() => {
  return seed({
    tagsData,
    ingredientsData,
    usersData,
    recipesData,
    commentsData,
    ratingsData,
    recipeTagsData,
    recipeIngredientsData,
    savedRecipesData,
  });
});
afterAll(() => {
  return db.end();
});

describe("authentication", () => {
  describe("POST /register", () => {
    test("201: should register a new user", () => {
      const newUser = {
        username: "testuser",
        email: "testuser@email.com",
        password: "mypassword",
      };
      return request(app)
        .post("/api/auth/register")
        .send(newUser)
        .expect(201)
        .then(({ body }) => {
          expect(body).toHaveProperty("token");
          expect(body.user.username).toBe(newUser.username);
          expect(body.user.email).toBe(newUser.email);
          expect(body.user.id).toBe(5)
          expect(body.user.profile_info).toBe(null)
        });
    });
    test("409: should give correct error if username already in use", () => {
      const newUser = {
        username: "madhatter",
        email: "testuser@email.com",
        password: "mypassword",
      };
      return request(app)
        .post("/api/auth/register")
        .send(newUser)
        .expect(409)
        .then(({ body }) => {
          expect(body.msg).toBe("Username Already Exists");
        });
    });
    test("400: should give correct error if email invalid", () => {
      const newUser = {
        username: "test",
        email: "my email",
        password: "mypassword",
      };
      return request(app)
        .post("/api/auth/register")
        .send(newUser)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid Email");
        });
    });
    test("400: should give correct error if body is missing require fields", () => {
      const newUser = {
        email: "my@email.com",
        password: "mypassword",
      };
      return request(app)
        .post("/api/auth/register")
        .send(newUser)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
  });
  describe("POST /login", () => {
    test("200: should log in with valid credentials", () => {
      const login = { username: "madhatter", password: "unsafepw" };
      return request(app)
        .post("/api/auth/login")
        .send(login)
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveProperty("token");
          expect(body.user.username).toBe(login.username);
          expect(body.user.email).toBe("madhatter@recipes.com");
          expect(body.user.id).toBe(1)
          expect(body.user.profile_info).toBe("I am new to cooking and here to teach myself a new skill")
        });
    });
    test("400: should give correct error when given an invalid username", () => {
      const login = { username: "test", password: "unsafepw" };
      return request(app)
        .post("/api/auth/login")
        .send(login)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid Username");
        });
    });
    test("400: should give correct error when given an invalid password", () => {
      const login = { username: "madhatter", password: "wrongpw" };
      return request(app)
        .post("/api/auth/login")
        .send(login)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid Password");
        });
    });
    test("400: should give correct error if body is missing username", () => {
      const login = { password: "wrongpw" };
      return request(app)
        .post("/api/auth/login")
        .send(login)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("400: should give correct error if body is missing password", () => {
      const login = { username: "madhatter" };
      return request(app)
        .post("/api/auth/login")
        .send(login)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
  });
  describe("Token Middleware", () => {
    const login = { username: "madhatter", password: "unsafepw" };
    let token;
    beforeAll(() => {
      return request(app)
        .post("/api/auth/login")
        .send(login)
        .then(({ body }) => {
          token = body.token;
        });
    });
    test("200: grant access to protected route with valid token", () => {
      return request(app)
        .get("/api/auth/profile")
        .set("x-auth-token", token)
        .expect(200)
        .then(({ body: { profile } }) => {
          expect(profile).toHaveProperty("username");
        });
    });
    test("401: respond with correct error trying to access a protected route with invalid token", () => {
      return request(app)
        .get("/api/auth/profile")
        .set("x-auth-token", "invalidtoken")
        .expect(401)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid Token");
        });
    });
    test("401: respond with correct error trying to access a protected route with missing token", () => {
      return request(app)
        .get("/api/auth/profile")
        .expect(401)
        .then(({ body }) => {
          expect(body.msg).toBe("Missing Token");
        });
    });
    test("401: respond with correct error trying to access a protected route with expired token", async () => {
      const expiredToken = jwt.sign({ id: 1 }, process.env.JWT_SECRET, {
        expiresIn: "1s",
      });
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          return request(app)
            .get("/api/auth/profile")
            .set("x-auth-token", expiredToken)
            .expect(401)
            .then(({ body }) => {
              expect(body.msg).toBe("Expired Token");
              resolve();
            })
            .catch((err) => {
              reject(err);
            });
        }, 2000);
      });
    });
  });
  describe("GET/PATCH /profile", () => {
    const login = { username: "new_user", password: "HeLoWrld123" };
    let token;
    beforeEach(() => {
      return request(app)
        .post("/api/auth/login")
        .send(login)
        .then(({ body }) => {
          token = body.token;
        });
    });
    test("200: responds with profile when given valid token", () => {
      return request(app)
        .get("/api/auth/profile")
        .set("x-auth-token", token)
        .expect(200)
        .then(({ body: { profile } }) => {
          expect(profile.username).toBe(login.username);
          expect(profile.email).toBe("hello@world.com");
          expect(profile.profile_info).toBe("Professional Chef");
          expect(profile.id).toBe(3)
        });
    });
    test("200: responds with updated profile_info", () => {
      return request(app)
        .patch("/api/auth/profile")
        .set("x-auth-token", token)
        .send({ profile_info: "Retired Chef" })
        .expect(200)
        .then(({ body: { profile } }) => {
          expect(profile.username).toBe(login.username);
          expect(profile.email).toBe("hello@world.com");
          expect(profile.profile_info).toBe("Retired Chef");
          expect(profile.id).toBe(3)
        });
    });

    test("200: responds with updated username", () => {
      return request(app)
        .patch("/api/auth/profile")
        .set("x-auth-token", token)
        .send({ username: "RetiredChef" })
        .expect(200)
        .then(({ body: { profile } }) => {
          expect(profile.email).toBe("hello@world.com");
          expect(profile.username).toBe("RetiredChef");
          expect(profile.id).toBe(3)
        });
    });
    test("200: responds with updated username and profile_info", () => {
      return request(app)
        .patch("/api/auth/profile")
        .set("x-auth-token", token)
        .send({ username: "RetiredChef", profile_info : "Retired Chef" })
        .expect(200)
        .then(({ body: { profile } }) => {
          expect(profile.email).toBe("hello@world.com");
          expect(profile.username).toBe("RetiredChef");
          expect(profile.profile_info).toBe("Retired Chef");
          expect(profile.id).toBe(3)
        });
    });
    test("409: responds with error when patch a username that is taken", () => {
      return request(app)
        .patch("/api/auth/profile")
        .set("x-auth-token", token)
        .send({ username: "campus" })
        .expect(409)
        .then(({ body }) => {
          expect(body.msg).toBe("Username Already Exists");
          
        });
    });
    test("200: hashes and updates password and send response", () => {
      return request(app)
        .patch("/api/auth/profile")
        .set("x-auth-token", token)
        .send({ password: "newpassword" })
        .expect(200)
        .then(({ body }) => {
          expect(body.msg).toBe("Your Password has been Updated");
        })
        .then(() => {
          return request(app)
            .post("/api/auth/login")
            .send({ username: "new_user", password: "newpassword" })
            .expect(200);
        })
        .then(({ body }) => {
          expect(body).toHaveProperty("token");
          expect(body.user.username).toBe("new_user");
        })
        .then(() => {
          return request(app)
            .post("/api/auth/login")
            .send({ username: "new_user", password: "HeLoWrld123" })
            .expect(400);
        })
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid Password");
        });
    });
    test("401: respond with correct error trying to access a endpoint with invalid token", () => {
      return request(app)
        .patch("/api/auth/profile")
        .set("x-auth-token", "invalidtoken")
        .send({ password: "newpassword" })
        .expect(401)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid Token");
        });
    });
    test("400: responds with correct error when send a patch request with no body", () => {
      return request(app)
        .patch("/api/auth/profile")
        .set("x-auth-token", token)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("400: responds with correct error when send an invalid patch request", () => {
      return request(app)
        .patch("/api/auth/profile")
        .set("x-auth-token", token)
        .send({ email: "newemail@test.com" })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("400: responds with correct error when send a patch request trying to patch password and info at same time", () => {
      return request(app)
        .patch("/api/auth/profile")
        .set("x-auth-token", token)
        .send({ password: "newpw", profile_info: "Retired Chef" })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
  });
});

describe("endpoints", () => {
  describe("GET /recipes", () => {
    test("200: returns an array of all recipes", () => {
      return request(app)
        .get("/api/recipes")
        .expect(200)
        .then(({ body: { recipes } }) => {
          expect(recipes.length).toBe(5);
        });
    });
    test("200: returns recipes with correct properties", () => {
      return request(app)
        .get("/api/recipes")
        .expect(200)
        .then(({ body: { recipes } }) => {
          recipes.forEach((recipe) => {
            expect(recipe).toHaveProperty("id");
            expect(recipe).toHaveProperty("name");
            expect(recipe).toHaveProperty("description");
            expect(recipe).toHaveProperty("instructions");
            expect(recipe).toHaveProperty("created_at");
            expect(recipe).toHaveProperty("created_by");
            expect(recipe).toHaveProperty("updated_at");
            expect(recipe).toHaveProperty("ingredients");
            expect(Array.isArray(recipe.ingredients)).toBe(true);
            expect(recipe).toHaveProperty("tags");
            expect(Array.isArray(recipe.tags)).toBe(true);
          });
        });
    });
    test("200: returns an correct array of ingredients for each recipe", () => {
      return request(app)
        .get("/api/recipes")
        .expect(200)
        .then(({ body: { recipes } }) => {
          expect(recipes[0].ingredients.length).toBe(4);
          expect(recipes[0].ingredients).toEqual([
            { ingredient: "Spaghetti", quantity: "200g" },
            { ingredient: "Pancetta", quantity: "100g" },
            { ingredient: "Eggs", quantity: "2 large" },
            { ingredient: "Parmesan Cheese", quantity: "50g" },
          ]);
        });
    });
    test("200: returns an correct array of tags for each recipe", () => {
      return request(app)
        .get("/api/recipes")
        .expect(200)
        .then(({ body: { recipes } }) => {
          expect(recipes[3].tags.length).toBe(4);
          expect(recipes[3].tags).toEqual([
            "Mexican",
            "Tacos",
            "Quick",
            "Healthy",
          ]);
        });
    });
  });
  describe("GET /recipes/:id", () => {
    test("200: returns a recipe by id", () => {
      return request(app)
        .get("/api/recipes/2")
        .expect(200)
        .then(({ body: { recipe } }) => {
          expect(recipe).toHaveProperty("id");
          expect(recipe).toHaveProperty("name");
          expect(recipe).toHaveProperty("description");
          expect(recipe).toHaveProperty("instructions");
          expect(recipe).toHaveProperty("created_at");
          expect(recipe).toHaveProperty("created_by");
          expect(recipe).toHaveProperty("updated_at");
          expect(recipe).toHaveProperty("ingredients");
          expect(Array.isArray(recipe.ingredients)).toBe(true);
        });
    });
    test("200: returns an correct array of ingredients for recipe", () => {
      return request(app)
        .get("/api/recipes/2")
        .expect(200)
        .then(({ body: { recipe } }) => {
          expect(recipe.ingredients.length).toBe(6);
          expect(recipe.ingredients).toEqual([
            { ingredient: "Chicken", quantity: "300g" },
            { ingredient: "Curry Powder", quantity: "2 tbsp" },
            { ingredient: "Onion", quantity: "1 medium" },
            { ingredient: "Garlic", quantity: "3 cloves" },
            { ingredient: "Tomatoes", quantity: "2 large" },
            { ingredient: "Coconut Milk", quantity: "400ml" },
          ]);
        });
    });
    test("200: returns an correct array of tags for recipe", () => {
      return request(app)
        .get("/api/recipes/2")
        .expect(200)
        .then(({ body: { recipe } }) => {
          expect(recipe.tags.length).toBe(2);
          expect(recipe.tags).toEqual(["Curry", "Chicken"]);
        });
    });
    test("404: returns error when given a non existant recipe id", () => {
      return request(app)
        .get("/api/recipes/999")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Recipe not Found");
        });
    });
    test("400: returns error when given a invalid recipe id", () => {
      return request(app)
        .get("/api/recipes/banana")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
  });
  describe("GET /ingredients", () => {
    test("200: responds with array of ingredients", () => {
      return request(app)
        .get("/api/ingredients")
        .expect(200)
        .then(({ body: { ingredients } }) => {
          expect(ingredients.length).toBe(22);
          ingredients.forEach((ingredient) => {
            expect(ingredient).toHaveProperty("id");
            expect(ingredient).toHaveProperty("name");
          });
          expect(ingredients[0]).toEqual({ id: 1, name: "Spaghetti" });
          expect(ingredients[20]).toEqual({ id: 21, name: "Olive Oil" });
        });
    });
  });
  describe("POST /ingredients", () => {
    test("201: returns new ingredient and adds to db", () => {
      return request(app)
        .post("/api/ingredients")
        .send({ name: "Butter" })
        .expect(201)
        .then(({ body: { ingredient } }) => {
          expect(ingredient).toEqual({ id: 23, name: "Butter" });
        });
    });
    test("400: returns error when body missing elements", () => {
      return request(app)
        .post("/api/ingredients")
        .send({})
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("409: returns error when posting an ingredient already in database", () => {
      return request(app)
        .post("/api/ingredients")
        .send({ name: "Spaghetti" })
        .expect(409)
        .then(({ body }) => {
          expect(body.msg).toBe("Already Exists");
        });
    });
    test("400: returns error when invalid request body", () => {
      return request(app)
        .post("/api/ingredients")
        .send({ name: ["Spaghetti"] })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("400: returns error when request body is an empty string", () => {
      return request(app)
        .post("/api/ingredients")
        .send({ name: "" })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
  });
  describe("GET /tags", () => {
    test("200: returns an array of all tags", () => {
      return request(app)
        .get("/api/tags")
        .expect(200)
        .then(({ body: { tags } }) => {
          expect(tags.length).toBe(11);
          tags.forEach((tag) => {
            expect(tag).toHaveProperty("id");
            expect(tag).toHaveProperty("name");
          });
          expect(tags[0]).toEqual({ id: 1, name: "Italian" });
          expect(tags[3]).toEqual({ id: 4, name: "Curry" });
          expect(tags[8]).toEqual({ id: 9, name: "Quick" });
        });
    });
  });
  describe("POST /tags", () => {
    test("201: returns new tag and adds to db", () => {
      return request(app)
        .post("/api/tags")
        .send({ name: "Chinese" })
        .expect(201)
        .then(({ body: { tag } }) => {
          expect(tag).toEqual({ id: 12, name: "Chinese" });
        });
    });
    test("400: returns error when request body is missing elements", () => {
      return request(app)
        .post("/api/tags")
        .send({})
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("409: returns error when tag already exists", () => {
      return request(app)
        .post("/api/tags")
        .send({ name: "Curry" })
        .expect(409)
        .then(({ body }) => {
          expect(body.msg).toBe("Already Exists");
        });
    });
    test("400: returns error when request body is invalid", () => {
      return request(app)
        .post("/api/tags")
        .send({ name: { name: "Chinese" } })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("400: returns error when request body is an empty string", () => {
      return request(app)
        .post("/api/tags")
        .send({ name: "" })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
  });

  describe("POST /recipes", () => {
    const login = { username: "madhatter", password: "unsafepw" };
    let token;
    beforeAll(() => {
      return request(app)
        .post("/api/auth/login")
        .send(login)
        .then(({ body }) => {
          token = body.token;
        });
    });
    test("201: posts and responds with new recipe", () => {
      const requestBody = {
        name: "Pesto Pasta",
        description: "Fresh and aromatic pasta with basil pesto",
        instructions:
          "1. Cook pasta. 2. Blend basil, garlic, pine nuts, and Parmesan cheese into pesto. 3. Mix with pasta and serve.",
        ingredients: [
          {
            id: 18,
            quantity: "200g",
          },
          {
            id: 19,
            quantity: "2 cups",
          },
          {
            id: 8,
            quantity: "2 cloves",
          },
          {
            id: 20,
            quantity: "1/4 cup",
          },
          {
            id: 4,
            quantity: "1/2 cup",
          },
          {
            id: 21,
            quantity: "1/4 cup",
          },
        ],
        tags: [1, 2, 9],
      };

      return request(app)
        .post("/api/recipes")
        .set("x-auth-token", token)
        .send(requestBody)
        .expect(201)
        .then(({ body: { recipe } }) => {
          expect(recipe).toHaveProperty("id");
          expect(recipe.name).toBe(requestBody.name);
          expect(recipe.description).toBe(requestBody.description);
          expect(recipe.instructions).toBe(requestBody.instructions);
          expect(recipe).toHaveProperty("created_at");
          expect(recipe).toHaveProperty("updated_at");
          expect(recipe.ingredients).toEqual([
            { ingredient: "Parmesan Cheese", quantity: "1/2 cup" },
            { ingredient: "Garlic", quantity: "2 cloves" },
            { ingredient: "Pasta", quantity: "200g" },
            { ingredient: "Basil", quantity: "2 cups" },
            { ingredient: "Pine Nuts", quantity: "1/4 cup" },
            { ingredient: "Olive Oil", quantity: "1/4 cup" },
          ]);
          expect(recipe.tags).toEqual(["Italian", "Pasta", "Quick"]);
          expect(recipe.created_by).toBe("madhatter");
        });
    });
    test("400: responds with error when body missing elements", () => {
      //require elements are name, instructions, ingredients
      const requestBody = {
        name: "test",
        instructions: "1.sdf 2. sfd",
      };

      return request(app)
        .post("/api/recipes")
        .set("x-auth-token", token)
        .send(requestBody)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("201: posts successfully when request has no tags", () => {
      const requestBody = {
        name: "test",
        instructions: "1.sdf 2. sfd",
        ingredients: [
          { id: 1, quantity: "200g" },
          { id: 2, quantity: 2 },
        ],
      };

      return request(app)
        .post("/api/recipes")
        .set("x-auth-token", token)
        .send(requestBody)
        .expect(201);
    });
    test("400: respond with error when request has invalid data types", () => {
      const requestBody = {
        name: "test",
        instructions: "1.sdf 2. sfd",
        ingredients: [1, 2, 3, 4],
      };

      return request(app)
        .post("/api/recipes")
        .set("x-auth-token", token)
        .send(requestBody)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("400: responds with error when request body is empty", () => {
      return request(app)
        .post("/api/recipes")
        .set("x-auth-token", token)
        .send({})
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("400: responds with error when ingredient has missing fields", () => {
      const requestBody = {
        name: "test",
        instructions: "1. sdf 2. sfd",
        ingredients: [{ id: 1 }],
      };

      return request(app)
        .post("/api/recipes")
        .set("x-auth-token", token)
        .send(requestBody)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("400: responds with error when tags contain invalid data types", () => {
      const requestBody = {
        name: "test",
        instructions: "1. sdf 2. sfd",
        ingredients: [{ id: 1, quantity: "200g" }],
        tags: ["invalidTag"],
      };

      return request(app)
        .post("/api/recipes")
        .set("x-auth-token", token)
        .send(requestBody)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("401: responds with error when trying to post recipe with invalid/missing/expired token", () => {
      const requestBody = {
        name: "test",
        instructions: "1. sdf 2. sfd",
        ingredients: [{ id: 1, quantity: "200g" }],
        tags: [1],
      };

      return request(app)
        .post("/api/recipes")
        .set("x-auth-token", "invalidtoken")
        .send(requestBody)
        .expect(401)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid Token");
        });
    });
  });
  describe("PATCH /recipes/:id", () => {
    const login = { username: "madhatter", password: "unsafepw" };
    let token;
    beforeAll(() => {
      return request(app)
        .post("/api/auth/login")
        .send(login)
        .then(({ body }) => {
          token = body.token;
        });
    });
    test("200: patches and repsonds with updated recipe", () => {
      return request(app)
        .patch("/api/recipes/1")
        .set("x-auth-token", token)
        .send({ name: "newName" })
        .expect(200)
        .then(({ body: { recipe } }) => {
          expect(recipe.name).toBe("newName");
          expect(recipe).toHaveProperty("id");
          expect(recipe).toHaveProperty("description");
          expect(recipe).toHaveProperty("instructions");
          expect(recipe).toHaveProperty("created_at");
          expect(recipe).toHaveProperty("created_by");
          expect(recipe).toHaveProperty("updated_at");
          expect(recipe).toHaveProperty("ingredients");
          expect(Array.isArray(recipe.ingredients)).toBe(true);
        });
    });
    test("200: patches and repsonds with updated recipe when patching two properties at once", () => {
      return request(app)
        .patch("/api/recipes/1")
        .set("x-auth-token", token)
        .send({ name: "newName", instructions: "newInstructions" })
        .expect(200)
        .then(({ body: { recipe } }) => {
          expect(recipe.name).toBe("newName");
          expect(recipe.instructions).toBe("newInstructions");
          expect(recipe).toHaveProperty("id");
          expect(recipe).toHaveProperty("description");
          expect(recipe).toHaveProperty("created_at");
          expect(recipe).toHaveProperty("updated_at");
          expect(recipe).toHaveProperty("ingredients");
          expect(Array.isArray(recipe.ingredients)).toBe(true);
        });
    });
    test("200: patches and repsonds with updated recipe when patching ingredients", () => {
      return request(app)
        .patch("/api/recipes/1")
        .set("x-auth-token", token)
        .send({
          ingredients: [
            {
              id: 18,
              quantity: "200g",
            },
            {
              id: 19,
              quantity: "2 cups",
            },
          ],
        })
        .expect(200)
        .then(({ body: { recipe } }) => {
          expect(recipe.name).toBe("Spaghetti Carbonara");
          expect(recipe).toHaveProperty("id");
          expect(recipe).toHaveProperty("description");
          expect(recipe).toHaveProperty("instructions");
          expect(recipe).toHaveProperty("created_at");
          expect(recipe).toHaveProperty("updated_at");
          expect(recipe).toHaveProperty("ingredients");
          expect(recipe.ingredients).toEqual([
            { ingredient: "Pasta", quantity: "200g" },
            { ingredient: "Basil", quantity: "2 cups" },
          ]);
        });
    });
    test("200: patches and repsonds with updated recipe when patching tags", () => {
      return request(app)
        .patch("/api/recipes/1")
        .set("x-auth-token", token)
        .send({ tags: [1, 2, 3] })
        .expect(200)
        .then(({ body: { recipe } }) => {
          expect(recipe.name).toBe("Spaghetti Carbonara");
          expect(recipe).toHaveProperty("id");
          expect(recipe).toHaveProperty("description");
          expect(recipe).toHaveProperty("instructions");
          expect(recipe).toHaveProperty("created_at");
          expect(recipe).toHaveProperty("created_by");
          expect(recipe).toHaveProperty("updated_at");
          expect(recipe).toHaveProperty("ingredients");
          expect(Array.isArray(recipe.ingredients)).toBe(true);
          expect(recipe.tags).toEqual(["Italian", "Pasta", "Spicy"]);
        });
    });
    test("200: after a successful patch the updated at column is updated", () => {
      const time = new Date().toISOString().substring(0, 16);
      return request(app)
        .patch("/api/recipes/1")
        .set("x-auth-token", token)
        .send({ name: "newName" })
        .expect(200)
        .then(({ body: { recipe } }) => {
          const updated_at = recipe.updated_at;
          const formattedUpdated = updated_at.substring(0, 16);
          expect(formattedUpdated).toBe(time);
        });
    });
    test("200: after a successful patch the updated at column is updated (tags)", () => {
      const time = new Date().toISOString().substring(0, 16);
      return request(app)
        .patch("/api/recipes/1")
        .set("x-auth-token", token)
        .send({ tags: [1, 2, 3] })
        .expect(200)
        .then(({ body: { recipe } }) => {
          const updated_at = recipe.updated_at;
          const formattedUpdated = updated_at.substring(0, 16);
          expect(formattedUpdated).toBe(time);
        });
    });
    test("200: after a successful patch the updated at column is updated (ing)", () => {
      const time = new Date().toISOString().substring(0, 16);
      return request(app)
        .patch("/api/recipes/1")
        .set("x-auth-token", token)
        .send({
          ingredients: [
            {
              id: 18,
              quantity: "200g",
            },
            {
              id: 19,
              quantity: "2 cups",
            },
          ],
        })
        .expect(200)
        .then(({ body: { recipe } }) => {
          const updated_at = recipe.updated_at;
          const formattedUpdated = updated_at.substring(0, 16);
          expect(formattedUpdated).toBe(time);
        });
    });
    test("400: returns error when empty request body", () => {
      return request(app)
        .patch("/api/recipes/1")
        .set("x-auth-token", token)
        .send()
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("400: returns error when invalid patch request", () => {
      return request(app)
        .patch("/api/recipes/1")
        .set("x-auth-token", token)
        .send({ created_by: "me" })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("401: returns error when missing token", () => {
      return request(app)
        .patch("/api/recipes/1")
        .send({ tags: [1, 2, 3] })
        .expect(401)
        .then(({ body }) => {
          expect(body.msg).toBe("Missing Token");
        });
    });
    test("400: returns error when trying to patch a recipe not created_by the user", () => {
      return request(app)
        .patch("/api/recipes/3")
        .set("x-auth-token", token)
        .send({ tags: [1, 2, 3] })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("You cannot update this recipe");
        });
    });
    test("404: returns error when trying to patch a non existant recipe_id", () => {
      return request(app)
        .patch("/api/recipes/999")
        .set("x-auth-token", token)
        .send({ tags: [1, 2, 3] })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not Found");
        });
    });
    test("400: returns error when trying to patch an invalid recipe id", () => {
      return request(app)
        .patch("/api/recipes/banana")
        .set("x-auth-token", token)
        .send({ tags: [1, 2, 3] })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
  });
  describe("DELETE /recipes/:id", () => {
    const login = { username: "madhatter", password: "unsafepw" };
    let token;
    beforeAll(() => {
      return request(app)
        .post("/api/auth/login")
        .send(login)
        .then(({ body }) => {
          token = body.token;
        });
    });
    test("204: deletes a recipe by recipe_id all everything referencing it in other tables", () => {
      return request(app)
        .delete("/api/recipes/1")
        .set("x-auth-token", token)
        .expect(204)
        .then((data) => {
          return request(app).get("/api/recipes/1").expect(404);
        })
        .then(() => {
          return db.query(`SELECT * FROM recipe_tags WHERE recipe_id = 1;`);
        })
        .then(({ rows }) => {
          expect(rows.length).toBe(0);
        })
        .then(() => {
          return db.query(
            `SELECT * FROM recipe_ingredients WHERE recipe_id = 1;`
          );
        })
        .then(({ rows }) => {
          expect(rows.length).toBe(0);
        })
        .then(() => {
          return db.query(`SELECT * FROM ratings WHERE recipe_id = 1;`);
        })
        .then(({ rows }) => {
          expect(rows.length).toBe(0);
        })
        .then(() => {
          return db.query(`SELECT * FROM comments WHERE recipe_id = 1;`);
        })
        .then(({ rows }) => {
          expect(rows.length).toBe(0);
        });
    });
    test("400: returns error when invalid id", () => {
      return request(app)
        .delete("/api/recipes/banana")
        .set("x-auth-token", token)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("400: returns error when non existant id", () => {
      return request(app)
        .delete("/api/recipes/999")
        .set("x-auth-token", token)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not Found");
        });
    });
    test("401: returns error when missing token", () => {
      return request(app)
        .delete("/api/recipes/1")
        .expect(401)
        .then(({ body }) => {
          expect(body.msg).toBe("Missing Token");
        });
    });
    test("401: returns error when invalid token", () => {
      return request(app)
        .delete("/api/recipes/1")
        .set("x-auth-token", "invalid")
        .expect(401)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid Token");
        });
    });
    test("401: returns error when valid token but unauthroized permissions", () => {
      return request(app)
        .delete("/api/recipes/4")
        .set("x-auth-token", token)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("You cannot update this recipe");
        });
    });
  });
  describe("GET /recipes filter by tags and ingredients", () => {
    test("200: returns all recipes when given a certain ingredient query", () => {
      return request(app)
        .get("/api/recipes?ingredients=spaghetti")
        .expect(200)
        .then(({ body: { recipes } }) => {
          expect(recipes.length).toBe(2);
          expect(recipes[0].name).toBe("Spaghetti Carbonara");
          expect(recipes[1].name).toBe("Spaghetti Bolognese");
          expect(recipes[0].id).toBe(1);
          expect(recipes[0]).toHaveProperty("description");
          expect(recipes[0]).toHaveProperty("instructions");
          expect(recipes[0]).toHaveProperty("created_at");
          expect(recipes[0]).toHaveProperty("created_by");
          expect(recipes[0]).toHaveProperty("updated_at");
          expect(recipes[0]).toHaveProperty("ingredients");
          expect(Array.isArray(recipes[0].ingredients)).toBe(true);
        });
    });
    test("404: returns error when given a invalid ingredient query", () => {
      return request(app)
        .get("/api/recipes?ingredients=123")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Resource not Found");
        });
    });
    test("200: returns empty array when given a valid ingredient but no recipes", () => {
      return request(app)
        .get("/api/recipes?ingredients=mushroom")
        .expect(200)
        .then(({ body: { recipes } }) => {
          expect(recipes).toEqual([]);
        });
    });
    test("200: returns all recipes when given a certain tag query", () => {
      return request(app)
        .get("/api/recipes?tags=quick")
        .expect(200)
        .then(({ body: { recipes } }) => {
          expect(recipes.length).toBe(2);
          expect(recipes[0].name).toBe("Vegetable Stir Fry");
          expect(recipes[1].name).toBe("Beef Tacos");
          expect(recipes[0].id).toBe(3);
          expect(recipes[0]).toHaveProperty("description");
          expect(recipes[0]).toHaveProperty("instructions");
          expect(recipes[0]).toHaveProperty("created_at");
          expect(recipes[0]).toHaveProperty("created_by");
          expect(recipes[0]).toHaveProperty("updated_at");
          expect(recipes[0]).toHaveProperty("ingredients");
          expect(Array.isArray(recipes[0].ingredients)).toBe(true);
        });
    });
    test("404: returns error when given a invalid ingredient query", () => {
      return request(app)
        .get("/api/recipes?tags=123")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Resource not Found");
        });
    });
    test("200: returns empty array when given a valid tag but no recipes", () => {
      return request(app)
        .get("/api/recipes?tags=korean")
        .expect(200)
        .then(({ body: { recipes } }) => {
          expect(recipes).toEqual([]);
        });
    });
  });
  describe("GET ratings/id", () => {
    test("200: returns array of all ratings by id and avergae rating", () => {
      return request(app)
        .get("/api/ratings/4")
        .expect(200)
        .then(({ body }) => {
          expect(body.ratings.length).toBe(2);
          body.ratings.forEach((rating) => {
            expect(rating.recipe_id).toBe(4);
            expect(rating).toHaveProperty("user_id");
            expect(rating).toHaveProperty("rating");
            expect(rating).toHaveProperty("created_at");
          });
          expect(body.average).toBe(4);
        });
    });
    test("404: returns error when given non-existant id", () => {
      return request(app)
        .get("/api/ratings/999")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Recipe not Found");
        });
    });
    test("400: returns error when given invalid id", () => {
      return request(app)
        .get("/api/ratings/banana")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("200: returns empty array when existant id but no ratings associated", () => {
      return request(app)
        .get("/api/ratings/5")
        .expect(200)
        .then(({ body }) => {
          expect(body.ratings).toEqual([]);
        });
    });
  });
  describe("POST ratings/id", () => {
    const login = { username: "madhatter", password: "unsafepw" };
    let token;
    beforeAll(() => {
      return request(app)
        .post("/api/auth/login")
        .send(login)
        .then(({ body }) => {
          token = body.token;
        });
    });
    test("201: returns newly posted rating and adds to db", () => {
      const time = new Date().toISOString().substring(0, 16);
      const requestBody = { rating: 5 };
      return request(app)
        .post("/api/ratings/2")
        .send(requestBody)
        .set("x-auth-token", token)
        .expect(201)
        .then(({ body: { rating } }) => {
          expect(rating.recipe_id).toBe(2);
          expect(rating.user_id).toBe(1);
          expect(rating.rating).toBe(5);
          expect(rating.created_at.substring(0, 16)).toBe(time);
        })
        .then(() => {
          return request(app).get("/api/ratings/2").expect(200);
        })
        .then(({ body }) => {
          expect(body.ratings.length).toBe(2);
          expect(body.average).toBe(4.5);
        });
    });
    test("400: responds with error when body missing elements", () => {
      return request(app)
        .post("/api/ratings/2")
        .set("x-auth-token", token)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("400: responds with error when body has invalid datatype", () => {
      return request(app)
        .post("/api/ratings/2")
        .set("x-auth-token", token)
        .send({ rating: "hello" })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("404: responds with error when non-existant id", () => {
      return request(app)
        .post("/api/ratings/999")
        .set("x-auth-token", token)
        .send({ rating: 4 })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Recipe not Found");
        });
    });
    test("400: responds with error when invalid id", () => {
      return request(app)
        .post("/api/ratings/banana")
        .set("x-auth-token", token)
        .send({ rating: 4 })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("401: responds with error trying to post with invalid/missing/expired token", () => {
      return request(app)
        .post("/api/ratings/1")
        .set("x-auth-token", "invalidToken")
        .send({ rating: 4 })
        .expect(401)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid Token");
        });
    });
    test("409: responds with error trying to post a rating to a recipe_id the user already has a rating for", () => {
      return request(app)
        .post("/api/ratings/1")
        .set("x-auth-token", token)
        .send({ rating: 4 })
        .expect(409)
        .then(({ body }) => {
          expect(body.msg).toBe("Already Exists");
        });
    });
  });
  describe("DELETE ratings/id", () => {
    const login = { username: "madhatter", password: "unsafepw" };
    let token;
    beforeAll(() => {
      return request(app)
        .post("/api/auth/login")
        .send(login)
        .then(({ body }) => {
          token = body.token;
        });
    });
    test("204: deletes rating by id from logged in user", () => {
      return request(app)
        .delete("/api/ratings/1")
        .set("x-auth-token", token)
        .expect(204)
        .then(() => {
          return request(app).get("/api/ratings/1").expect(200);
        })
        .then(({ body: { ratings } }) => {
          expect(ratings).toEqual([]);
        });
    });
    test("404: returns error when attempting to delete a non existant rating from a valid recipe_id", () => {
      return request(app)
        .delete("/api/ratings/5")
        .set("x-auth-token", token)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Rating not Found");
        });
    });
    test("404: returns error when attempting to delete a non existant rating from a non-existant recipe_id", () => {
      return request(app)
        .delete("/api/ratings/999")
        .set("x-auth-token", token)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Recipe not Found");
        });
    });
    test("400: returns error when attempting to delete a non existant rating from a invalid recipe_id", () => {
      return request(app)
        .delete("/api/ratings/banana")
        .set("x-auth-token", token)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("401: returns error when attempting to delete a rating with an invalid/missing/expired token", () => {
      return request(app)
        .delete("/api/ratings/1")
        .expect(401)
        .then(({ body }) => {
          expect(body.msg).toBe("Missing Token");
        });
    });
  });
  describe("GET comments/id", () => {
    test("200: returns an array of all comments by recipe_id", () => {
      return request(app)
        .get("/api/comments/3")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(2);
          comments.forEach((comment) => {
            expect(comment.recipe_id).toBe(3);
            expect(comment).toHaveProperty("user_id");
            expect(comment).toHaveProperty("body");
            expect(comment).toHaveProperty("created_at");
          });
        });
    });
    test("404: returns error when given non-existant id", () => {
      return request(app)
        .get("/api/comments/999")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Recipe not Found");
        });
    });
    test("400: returns error when given invalid id", () => {
      return request(app)
        .get("/api/comments/banana")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("200: returns empty array when existant id but no ratings associated", () => {
      return request(app)
        .get("/api/comments/5")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toEqual([]);
        });
    });
  });
  describe("POST commnets/id", () => {
    const login = { username: "madhatter", password: "unsafepw" };
    let token;
    beforeAll(() => {
      return request(app)
        .post("/api/auth/login")
        .send(login)
        .then(({ body }) => {
          token = body.token;
        });
    });
    test("201: returns newly posted comment and adds to db", () => {
      const time = new Date().toISOString().substring(0, 16);
      const requestBody = { body: "This recipe was great!" };
      return request(app)
        .post("/api/comments/2")
        .send(requestBody)
        .set("x-auth-token", token)
        .expect(201)
        .then(({ body: { comment } }) => {
          expect(comment.recipe_id).toBe(2);
          expect(comment.user_id).toBe(1);
          expect(comment.body).toBe(requestBody.body);
          expect(comment.created_at.substring(0, 16)).toBe(time);
        })
        .then(() => {
          return request(app).get("/api/comments/2").expect(200);
        })
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(2);
        });
    });
    test("400: responds with error when body missing elements", () => {
      return request(app)
        .post("/api/comments/2")
        .set("x-auth-token", token)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("404: responds with error when given an non-existant id", () => {
      return request(app)
        .post("/api/comments/999")
        .set("x-auth-token", token)
        .send({ body: "nice!" })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Recipe not Found");
        });
    });
    test("400: responds with error when given an invalid id", () => {
      return request(app)
        .post("/api/comments/banana")
        .set("x-auth-token", token)
        .send({ body: "nice!" })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("401: responds with error trying to post with invalid/missing/expired token", () => {
      return request(app)
        .post("/api/comments/1")
        .set("x-auth-token", "invalidToken")
        .send({ body: "nice!" })
        .expect(401)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid Token");
        });
    });
  });
  describe("DELETE comments/id", ()=>{
    const login = { username: "madhatter", password: "unsafepw" };
    let token;
    beforeAll(() => {
      return request(app)
        .post("/api/auth/login")
        .send(login)
        .then(({ body }) => {
          token = body.token;
        });
    });
    test("204: deletes comment from logged in user by comment id", ()=>{
      return request(app)
      .delete("/api/comments/1")
      .set("x-auth-token", token)
      .expect(204)
      .then(()=>{
        return request(app).get("/api/comments/1").expect(200);
      })
      .then(({body:{comments}}) => {
        expect(comments).toEqual([])
      })
    })
    test("404: returns error when using non-existant id", ()=>{
      return request(app)
      .delete("/api/comments/999")
      .set("x-auth-token", token)
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe("Comment not Found")
      })
    })
    test("400: returns error when using invalid id", ()=>{
      return request(app)
      .delete("/api/comments/banana")
      .set("x-auth-token", token)
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe("Bad Request")
      })
    })
    test("401: returns error when attempting to delete a rating with an invalid/missing/expired token", () => {
      return request(app)
        .delete("/api/comments/1")
        .expect(401)
        .then(({ body }) => {
          expect(body.msg).toBe("Missing Token");
        });
    });
    test("401: returns error when attempting to delete a comment not belonging to logged in user", ()=>{
      return request(app)
      .delete("/api/comments/2")
      .set("x-auth-token", token)
      .expect(401)
      .then(({body}) => {
        expect(body.msg).toBe("You cannot delete this comment")
      })
    })
  })
  describe("GET ratings", ()=>{
    test("200: returns array of all recipes with ratings and averages", ()=>{
      return request(app)
      .get("/api/ratings")
      .expect(200)
      .then(({body}) =>{
        // console.log(body.ratings[0])
        expect(body.ratings.length).toBe(4)
        body.ratings.forEach((recipe) => {
          expect(recipe).toHaveProperty("id");
          expect(recipe).toHaveProperty("ratings");
          expect(recipe).toHaveProperty("average");
        });
      })
    })
  })
  describe("PATCH /ratings/id", ()=>{
    const login = { username: "madhatter", password: "unsafepw" };
    let token;
    beforeAll(() => {
      return request(app)
        .post("/api/auth/login")
        .send(login)
        .then(({ body }) => {
          token = body.token;
        });
    });
    test("200: updates rating by id from logged in user", ()=>{
      const requestBody = { rating: 2 };
      const time = new Date().toISOString().substring(0, 16);
      return request(app)
      .patch("/api/ratings/3")
      .send(requestBody)
      .set("x-auth-token", token)
      .expect(200)
      .then(({body: {rating}})=>{
        expect(rating.recipe_id).toBe(3);
        expect(rating.user_id).toBe(1);
        expect(rating.rating).toBe(2);
        expect(rating.created_at.substring(0, 16)).toBe(time);
        expect(rating.id).toBe(4)
      })
      .then(() => {
        return request(app).get("/api/ratings/3").expect(200);
      })
      .then(({ body }) => {
        expect(body.ratings.length).toBe(2);
        expect(body.average).toBe(3);
      });
    })
    test("400: returns error when empty request body", () => {
      return request(app)
      .patch("/api/recipes/3")
      .set("x-auth-token", token)
      .send()
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
        });
    })
    test("400: returns error when invalid patch request",()=>{
      return request(app)
        .patch("/api/ratings/3")
        .set("x-auth-token", token)
        .send("2")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    })
    test("401: returns error when missing token", ()=>{
      return request(app)
        .patch("/api/ratings/3")
        .send({rating: 2})
        .expect(401)
        .then(({ body }) => {
          expect(body.msg).toBe("Missing Token");
        });
    })
    test("404: returns error when attempting to patch non existant rating id", ()=>{
      return request(app)
        .patch("/api/ratings/2")
        .set("x-auth-token", token)
        .send({ rating: 2})
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not Found");
        });
    })
    test("404: returns error when attempting to patch invalid rating id", ()=>{
      return request(app)
        .patch("/api/ratings/banaba")
        .set("x-auth-token", token)
        .send({ rating: 2})
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    })
  })
  describe("GET /saved-recipes/", ()=>{
    const login = { username: "harry89", password: "jsdf347!9Jsdsa378" };
    let token;
    beforeAll(() => {
      return request(app)
        .post("/api/auth/login")
        .send(login)
        .then(({ body }) => {
          token = body.token;
        });
    });
    test("200: returns list of all saved recipes by user id", ()=>{
      return request(app)
        .get("/api/saved-recipes")
        .set("x-auth-token", token)
        .expect(200)
        .then(({body}) => {
          expect(body.savedRecipes.length).toBe(3)
          expect(body.savedRecipes[0].recipe_id).toBe(1)
          body.savedRecipes.forEach(recipe => {
            expect(recipe.user_id).toBe(4)
            expect(recipe).toHaveProperty("recipe_id")
            expect(recipe).toHaveProperty("created_at")
          })
        })
    })
    test("200: returns empty array when user has no saved recipe", ()=>{
      let emptyToken;
      return request(app)
        .post("/api/auth/login")
        .send({username: "campus", password: "password"})
        .then(({body}) => {
          emptyToken = body.token
        })
        .then(()=>{
          return request(app)
          .get("/api/saved-recipes")
          .set("x-auth-token", emptyToken)
          .expect(200)
        })
        .then(({body}) => {
          expect(body.savedRecipes).toEqual([])
        })
    })
    test("401: returns error when missing token", () => {
      return request(app)
        .get("/api/saved-recipes")
        .expect(401)
        .then(({ body }) => {
          expect(body.msg).toBe("Missing Token");
        });
    });
    test("401: returns error when invalid token", () => {
      return request(app)
        .get("/api/saved-recipes")
        .set("x-auth-token", "invalid")
        .expect(401)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid Token");
        });
    });
  })
  describe("POST /saved-recipes/", ()=>{
    const login = { username: "madhatter", password: "unsafepw" };
    let token;
    beforeAll(() => {
      return request(app)
        .post("/api/auth/login")
        .send(login)
        .then(({ body }) => {
          token = body.token;
        });
    });
    test("201: returns savedRecipe and adds to db", ()=>{
      const time = new Date().toISOString().substring(0, 16);
      const requestBody = { recipe_id: 5 };
      return request(app)
        .post("/api/saved-recipes")
        .send(requestBody)
        .set("x-auth-token", token)
        .expect(201)
        .then(({ body: { savedRecipe } }) => {
          expect(savedRecipe.recipe_id).toBe(5);
          expect(savedRecipe.user_id).toBe(1);
          expect(savedRecipe.created_at.substring(0, 16)).toBe(time);
        })
    })
    test("400: returns error when missing recipe_id in body", ()=>{
      return request(app)
        .post("/api/saved-recipes")
        .set("x-auth-token", token)
        .send({comment: "hello"})
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    })
    test("404: returns error when invalid body", ()=>{
      return request(app)
        .post("/api/saved-recipes")
        .set("x-auth-token", token)
        .send({recipe_id : 99})
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Recipe not Found");
        });
    })
    test("404: returns error when invalid recipe id data type", ()=>{
      return request(app)
        .post("/api/saved-recipes")
        .set("x-auth-token", token)
        .send({recipe_id : "hello"})
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    })
    test("401: returns error when missing token", () => {
      return request(app)
        .post("/api/saved-recipes")
        .expect(401)
        .then(({ body }) => {
          expect(body.msg).toBe("Missing Token");
        });
    });
    test("401: returns error when invalid token", () => {
      return request(app)
        .post("/api/saved-recipes")
        .set("x-auth-token", "invalid")
        .expect(401)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid Token");
        });
    });
    test("409: returns error when user tries to save same recipe more than once", () => {
      const requestBody = { recipe_id: 3 };
      return request(app)
      .post("/api/saved-recipes")
        .send(requestBody)
        .set("x-auth-token", token)
        .expect(409)
        .then(({body}) => {
          expect(body.msg).toBe("Already Exists")
        })
    })
  })
  describe("DELETE /save-recipes", ()=>{
    const login = { username: "madhatter", password: "unsafepw" };
    let token;
    beforeAll(() => {
      return request(app)
        .post("/api/auth/login")
        .send(login)
        .then(({ body }) => {
          token = body.token;
        });
    });
    test("204: deletes recipe from saved recipes", () => {
      const requestBody = { recipe_id: 3 };
      return request(app)
      .delete("/api/saved-recipes")
      .send(requestBody)
      .set("x-auth-token", token)
      .expect(204)
      .then(() => {
        return request(app).get("/api/saved-recipes")
        .set("x-auth-token", token)
        .expect(200)
      })
      .then(({body}) => {
        expect(body.savedRecipes.length).toBe(1)
      })
    })
    test("400: returns error when recipe_id in body is invalid data type", ()=>{
      return request(app)
        .delete("/api/saved-recipes")
        .set("x-auth-token", token)
        .send({recipe_id: "hello"})
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    })
    test("404: returns error when missing body", ()=>{
      return request(app)
        .delete("/api/saved-recipes")
        .set("x-auth-token", token)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Saved Recipe not Found");
        });
    })
    test("404: returns error when attempting to delete an unsaved recipe", ()=>{
      return request(app)
        .delete("/api/saved-recipes")
        .set("x-auth-token", token)
        .send({recipe_id : 1})
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Saved Recipe not Found");
        });
    })
    test("401: returns error when missing token", () => {
      return request(app)
        .delete("/api/saved-recipes")
        .expect(401)
        .then(({ body }) => {
          expect(body.msg).toBe("Missing Token");
        });
    });
    test("401: returns error when invalid token", () => {
      return request(app)
        .delete("/api/saved-recipes")
        .set("x-auth-token", "invalid")
        .expect(401)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid Token");
        });
    });
  })
  describe("GET comments", ()=>{
    test("200: returns array of all recipes with all comments", ()=>{
      return request(app)
      .get("/api/comments")
      .expect(200)
      .then(({body}) =>{
        expect(body.comments.length).toBe(4)
        expect(body.comments[2].comments.length).toBe(2)
        expect(body.comments[2].id).toBe(3)
        body.comments.forEach((recipe) => {
          expect(recipe).toHaveProperty("id");
          expect(recipe).toHaveProperty("comments");
        });
      })
    })
  })
});
