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
} = require("../db/data/test-data/index");

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
          expect(body.user.id).toBe(5);
          expect(body.password).not.toBe(newUser.password);
        });
    });
    test("409: should give correct error if email already in use", () => {
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
          expect(body.msg).toBe("Already Exists");
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
          expect(body.user.id).toBe(1);
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
        .then(()=>{
          return request(app)
          .post("/api/auth/login")
          .send({ username: "new_user", password: "newpassword" })
          .expect(200)
        })
        .then(({body})=>{
          expect(body).toHaveProperty("token");
          expect(body.user.username).toBe("new_user");
          expect(body.user.id).toBe(3);
        })
        .then(()=>{
          return request(app)
          .post("/api/auth/login")
          .send({ username: "new_user", password: "HeLoWrld123" })
          .expect(400)
        })
        .then(({body}) => {
          expect(body.msg).toBe("Invalid Password")
        })
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
    test("400: responds with correct error when send a patch request with no body" ,() => {
      return request(app)
      .patch("/api/auth/profile")
      .set("x-auth-token", token)
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe("Bad Request")
      })
    })
    test("400: responds with correct error when send an invalid patch request" ,() => {
      return request(app)
      .patch("/api/auth/profile")
      .set("x-auth-token", token)
      .send({ email: "newemail@test.com" })
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe("Bad Request")
      })
    })
    test("400: responds with correct error when send a patch request trying to patch password and info at same time" ,() => {
      return request(app)
      .patch("/api/auth/profile")
      .set("x-auth-token", token)
      .send({ password: "newpw", profile_info: "Retired Chef" })
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe("Bad Request")
      })
    })
  });
});

describe("endpoints", ()=>{
  describe.only("GET /recipes", () => {
    test("200: returns an array of all recipes", ()=>{
      return request(app)
      .get("/api/recipes")
      .expect(200)
      .then(({body: {recipes}}) => {
        expect(recipes.length).toBe(4)
      })
    })
    test("200: returns recipes with correct properties", ()=>{
      return request(app)
      .get("/api/recipes")
      .expect(200)
      .then(({body: {recipes}}) => {
        recipes.forEach(recipe => {
          expect(recipe).toHaveProperty("id")
          expect(recipe).toHaveProperty("name")
          expect(recipe).toHaveProperty("description")
          expect(recipe).toHaveProperty("instructions")
          expect(recipe).toHaveProperty("created_at")
          expect(recipe).toHaveProperty("updated_at")
          expect(recipe).toHaveProperty("ingredients")
          expect(Array.isArray(recipe.ingredients)).toBe(true)
        })

      })
    })
    test("200: returns an correct array of ingredients for each recipe", ()=>{
      return request(app)
      .get("/api/recipes")
      .expect(200)
      .then(({body: {recipes}}) => {
        expect(recipes[0].ingredients.length).toBe(4)
        expect(recipes[0].ingredients).toEqual(['Spaghetti', 'Pancetta', 'Eggs', 'Parmesan Cheese'])
      })
    })
  })
})