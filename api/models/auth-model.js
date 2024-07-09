const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../db/connection");
const isValidEmail = require("../utils");

exports.registerUser = (username, email, password) => {
  if (!isValidEmail(email)) {
    return Promise.reject({ status: 400, msg: "Invalid Email" });
  }
  return bcrypt
    .genSalt()
    .then((salt) => bcrypt.hash(password, salt))
    .then((hashedPassword) => {
      const queryStr = `INSERT INTO users (username, email, password)
                          VALUES ($1, $2, $3)
                          RETURNING *;`;
      return db.query(queryStr, [username, email, hashedPassword]);
    })
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.logInUser = (username, password) => {
    if(!username || !password) return Promise.reject({status:400, msg: 'Bad Request'})
    return db.query(`SELECT * FROM users WHERE username = $1`, [username])
    .then(({rows}) => {
        if(!rows.length) return Promise.reject({status:400, msg: 'Invalid Username'})
        user = rows[0]
        return bcrypt.compare(password, user.password)
    })
    .then(passwordCorrect => {
        if(!passwordCorrect) return Promise.reject({status:400, msg: 'Invalid Password'})
        return user
    })
}

exports.selectProfile = () => {
  const queryStr =  `SELECT * FROM users WHERE id = 1;`
  return db.query(queryStr)
  .then(({rows}) => {
    return rows[0]
  })
}