const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { ErrorHandler } = require('../errors/error');

//  errors
const { ERROR_CODES, ERROR_MESSAGES } = require('../utils/constants');

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
        throw new ErrorHandler(ERROR_CODES.notFound, ERROR_MESSAGES.notFound);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new ErrorHandler(ERROR_CODES.invalidData, ERROR_MESSAGES.invalidData);
      }
      next(err);
    })
    .catch(next);
};

// create new user
module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  bcrypt.hash(password, 10).then((hash) => User.create({
    name,
    email,
    password: hash,
  }))
    .then((user) => res.status(201).send({ _id: user._id }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ErrorHandler(ERROR_CODES.invalidData, ERROR_MESSAGES.invalidData);
      } else if (err.code === 11000) {
        throw new ErrorHandler(ERROR_CODES.conflict, ERROR_MESSAGES.conflict);
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
        throw new ErrorHandler(ERROR_CODES.authorization, ERROR_MESSAGES.authorization);
      }
      const matched = bcrypt.compare(password, user.password);
      return Promise.all([matched, user]);
    }).then(([matched, user]) => {
      if (!matched) {
        throw new ErrorHandler(ERROR_CODES.authorization, ERROR_MESSAGES.authorization);
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
        throw new ErrorHandler(ERROR_CODES.authorization, ERROR_MESSAGES.authorization);
      }
      next(err);
    })
    .catch(next);
};
