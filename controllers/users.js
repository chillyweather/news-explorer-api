const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { ErrorHandler } = require('../errors/error');

//  errors
const INVALID_DATA_ERROR = 400;
const AUTHORIZATION_ERROR = 401;
const NOT_FOUND_ERROR = 404;
const CONFLICT_ERROR = 409;

const User = require('../models/user');

dotenv.config();
const { NODE_ENV, JWT_SECRET } = process.env;

// get user by id
module.exports.getUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail()
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        throw new ErrorHandler(NOT_FOUND_ERROR, 'User not found');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new ErrorHandler(INVALID_DATA_ERROR, 'Invalid data');
      }
      next(err);
    })
    .catch(next);
};

// create new user
module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10).then((hash) => User.create({
    name,
    about,
    avatar,
    email,
    password: hash,
  }))
    .then((user) => res.status(201).send({ _id: user._id }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ErrorHandler(INVALID_DATA_ERROR, 'Invalid data');
      } else if (err.code === 11000) {
        throw new ErrorHandler(CONFLICT_ERROR, 'User with this email already exists');
      } next(err);
    })
    .catch(next);
};

//  user login
module.exports.userLogin = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .select('+password')
    .then((user) => {
      // let currentUser = user;
      if (!user) {
        throw new ErrorHandler(AUTHORIZATION_ERROR, 'Incorrect password or email');
      }
      const matched = bcrypt.compare(password, user.password);
      return Promise.all([matched, user]);
    }).then(([matched, user]) => {
      if (!matched) {
        throw new ErrorHandler(AUTHORIZATION_ERROR, 'Incorrect password or email');
      }
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res.header('authorization', `Bearer ${token}`);
      res.cookie('token', token, { httpOnly: true });
      res.status(200).send({ token });
    })
    .catch((err) => {
      if (err.code === 401) {
        throw new ErrorHandler(AUTHORIZATION_ERROR, 'Incorrect password or email');
      }
      next(err);
    })
    .catch(next);
};
