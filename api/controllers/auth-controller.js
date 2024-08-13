const {
  registerUser,
  logInUser,
  selectProfile,
  updateProfile,
} = require("../models/auth-model");
const jwt = require("jsonwebtoken");

exports.postNewUser = (req, res, next) => {
  const { username, email, password } = req.body;
  registerUser(username, email, password)
    .then((newUser) => {
      const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.status(201).send({ token: token, user: newUser });
    })
    .catch(next);
};

exports.postLoginIn = (req, res, next) => {
  const { username, password } = req.body;
  logInUser(username, password)
    .then((user) => {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.status(200).send({ token: token, user: {username: user.username, email: user.email} });
    })
    .catch(next);
};

exports.getProfile = (req, res, next) => {
  const user_id = req.user_id;
  selectProfile(user_id)
    .then((profile) => {
      res.status(200).send({ profile });
    })
    .catch(next);
};

exports.patchProfile = (req, res, next) => {
  const { profile_info, password } = req.body;
  const user_id = req.user_id;
  updateProfile(user_id, profile_info, password)
    .then((profile) => {
      if (password) {
        res.status(200).send({msg: 'Your Password has been Updated'});
      } else {
        res.status(200).send({ profile });
      }
    })
    .catch(next);
};
