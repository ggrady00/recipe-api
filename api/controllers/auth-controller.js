const {
  registerUser,
  logInUser,
  selectProfile,
  updateProfile,
} = require("../models/auth-model");
const jwt = require("jsonwebtoken");
const cloudinary = require("../cloudinary")


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
      res.status(200).send({ token: token, user: {username: user.username, email: user.email, id: user.id, profile_info: user.profile_info, profile_pic: user.profile_pic} });
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
  const { username, profile_info, password } = req.body;
  const user_id = req.user_id;
  let profile_pic;
  if(req.file) {
    return new Promise((res, rej) => {
      const stream = cloudinary.uploader.upload_stream(
        {folder: "profile_pics"},
        (err, uploadResult) => {
          if (err) rej(err);
          res(uploadResult.secure_url)
        }
      )
      stream.end(req.file.buffer)
    })
    .then(url => {
      const profile_pic = url
      return updateProfile(user_id, username, profile_info, password, profile_pic)
    })
    .then((profile) => {
      res.status(200).send({profile})
    })

  } else {
  updateProfile(user_id, username, profile_info, password, profile_pic)
    .then((profile) => {
      if (password) {
        res.status(200).send({msg: 'Your Password has been Updated'});
      } else {
        res.status(200).send({ profile });
      }
    })
    .catch(next);
  }
};
