const express = require('express');
const helmet = require('helmet');

//  error handling
// const { ErrorHandler } = require('./errors/error');ls

// current time just for maintenance reasons
const today = new Date();
const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

const { PORT = 3001 } = process.env;

const app = express();

//  use helmet
app.use(helmet());
app.use(express.json());

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

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`server is running on port ${PORT}\nLast restarted at ${time}`);
});
