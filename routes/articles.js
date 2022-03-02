const express = require('express');
const validator = require('validator');
const { celebrate, Joi } = require('celebrate');

const { getAllArticles, createArticle, deleteArticle } = require('../controllers/articles');

const validateUrl = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error('string.uri');
};

const router = express.Router();

// return all articles saved by the user
router.get('/', getAllArticles);

// create an article
router.post('/', celebrate({
  body: Joi.object().keys({
    keyword: Joi.string().required(),
    title: Joi.string().required(),
    text: Joi.string().required(),
    date: Joi.string().required(),
    source: Joi.string().required(),
    link: Joi.string().required().custom(validateUrl),
    image: Joi.string().required().custom(validateUrl),
  }),
}), createArticle);

// delete article by _id
router.delete(
  '/:id',
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().required(),
      // id: Joi.string().length(24).hex().required(),
    }),
  }),

  deleteArticle,
);

module.exports = router;
