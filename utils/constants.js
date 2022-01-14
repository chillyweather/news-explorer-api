const rateLimit = require('express-rate-limit');

module.exports.limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
});

module.exports.ERROR_CODES = {
  invalidData: 400,
  authorization: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  default: 500,
};

module.exports.ERROR_MESSAGES = {
  invalidData: 'Invalid data',
  authorization: 'Incorrect password or email',
  authRequired: 'Authorization required',
  forbidden: 'Only owner can delete this article',
  notFound: 'Requested resource not found',
  conflict: 'User with this email already exists',
  default: 'An error has occurred on the server',
};
