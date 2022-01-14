const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const { NODE_ENV, JWT_SECRET } = process.env;
const { ErrorHandler } = require('../errors/error');

//  errors
const { ERROR_CODES } = require('../utils/constants');
const { ERROR_MESSAGES } = require('../utils/constants');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new ErrorHandler(ERROR_CODES.authorization, ERROR_MESSAGES.authRequired);
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    // payload = jwt.verify(token, 'dev-secret');
    payload = jwt.verify(
      token,
      NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
    );
  } catch (err) {
    throw new ErrorHandler(ERROR_CODES.authorization, ERROR_MESSAGES.authRequired);
  }

  req.user = payload; // assigning the payload to the request object

  next(); // sending the request to the next middleware
};
