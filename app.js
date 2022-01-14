const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { errors, Joi, celebrate } = require('celebrate');
const cors = require('cors');

//  import request limiter
const { limiter } = require('./utils/constants');

//  import constants
const { ERROR_CODES, ERROR_MESSAGES } = require('./utils/constants');

// current time just for maintenance reasons
const today = new Date();
const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

const { PORT = 3001, NEWS_DB, NODE_ENV } = process.env;

//  error handling
const { ErrorHandler, handleError } = require('./errors/error');

//  import routes
const routes = require('./routes/index');

//  import loggers
const { requestLogger, errorLogger } = require('./middleware/logger');

//  controllers
const { createUser, userLogin } = require('./controllers/users');

//  connect database
const dbLocation = NODE_ENV === 'production' ? NEWS_DB : 'mongodb://localhost:27017/newsdb';

mongoose.connect(dbLocation, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();

//  use helmet
app.use(helmet());
app.use(express.json());

// limit amount of requests
app.use(limiter);

//  Cors
app.use(cors());
app.options('*', cors());

//  allows for rich objects and arrays to be encoded into the URL-encoded format
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

//  logging requests
app.use(requestLogger);

//  register route
app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  createUser,
);

//  login route
app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  userLogin,
);
//  routers
// app.use('/users', auth, userRouter);
// app.use('/articles', auth, articleRouter);
app.use('/', routes);

//  error logger
app.use(errorLogger);

//  celebrate error handler
app.use(errors());

// 404 for non-exist pages
// eslint-disable-next-line no-unused-vars
app.get('*', (req, res) => {
  throw new ErrorHandler(ERROR_CODES.default, ERROR_MESSAGES.notFound);
});

//  global error handler
app.use((err, req, res, next) => {
  handleError(err, res);
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`server is running on port ${PORT}\nLast restarted at ${time}`);
});
