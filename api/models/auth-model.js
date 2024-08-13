const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../db/connection");
const isValidEmail = require("../utils");
const format = require("pg-format");

async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password, salt)
    return hashedPassword
  } catch(err) {
    console.log('Error hashing password')
  }
}


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
                          RETURNING id, username, email;`;
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

exports.selectProfile = (id) => {
  const queryStr =  `SELECT username, email, profile_info FROM users WHERE id = $1;`
  return db.query(queryStr, [id])
  .then(({rows}) => {
    return rows[0]
  })
}

exports.updateProfile = async (id, profile_info, password) => {
  if (!profile_info && !password) return Promise.reject({status:400, msg: "Bad Request"})
  if (profile_info && password) return Promise.reject({status:400, msg: "Bad Request"})
  let queryStr = `UPDATE users`
  const queryValues = []
  if(profile_info) {
    queryStr += ` SET profile_info = %L`
    queryValues.push(profile_info)
  }
  if(password) {
    const hashedPassword = await hashPassword(password)
    queryStr += ` SET password = %L`
    queryValues.push(hashedPassword)
  }

  queryStr += ` WHERE id = %L RETURNING username, email, profile_info;`
  queryValues.push(id)

  const finalQueryStr = format(queryStr, ...queryValues)
  
  return db.query(finalQueryStr)
  .then(({rows})=>{
    return rows[0]
  })
}