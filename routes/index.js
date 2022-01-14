const express = require('express');

const router = express.Router();

const users = require('./users');
const articles = require('./articles');
const auth = require('../middleware/auth');

router.use('/', auth);
router.use('/users', users);
router.use('/articles', articles);

module.exports = router;
