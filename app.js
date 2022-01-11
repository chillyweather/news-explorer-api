const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { errors, Joi, celebrate } = require('celebrate');

//  import routes
const userRouter = require('./routes/users');
const articleRouter = require('./routes/articles');

//  import loggers
const { requestLogger, errorLogger } = require('./middleware/logger');

const { createUser, userLogin } = require('./controllers/users');

//  error handling
const { ErrorHandler } = require('./errors/error');

// current time just for maintenance reasons
const today = new Date();
const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

const { PORT = 3001 } = process.env;

const app = express();
const auth = require('./middleware/auth');

//  connect database
mongoose.connect('mongodb://localhost:27017/newsdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//  use helmet
app.use(helmet());
app.use(express.json());

app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

//  logging requests
app.use(requestLogger);

//  routers
app.use('/users', auth, userRouter);
app.use('/articles', auth, articleRouter);

//  register
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

//  login
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

//  error logger
app.use(errorLogger);

//  celebrate error handler
app.use(errors());

//  global error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message:
        statusCode === 500 ? 'Server error' : message,
    });
});

// 404 for non-exist pages
// eslint-disable-next-line no-unused-vars
app.get('*', (req, res) => {
  throw new ErrorHandler(404, 'Requested resource not found');
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`server is running on port ${PORT}\nLast restarted at ${time}`);
});
