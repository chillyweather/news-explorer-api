const { ErrorHandler } = require('../errors/error');

//  errors
const { ERROR_CODES, ERROR_MESSAGES } = require('../utils/constants');

const Article = require('../models/article');

//  get all articles
module.exports.getAllArticles = (req, res, next) => {
  Article.find({})
    .then((articles) => res.send(articles))
    .catch((err) => {
      next(err);
    })
    .catch(next);
};

//  create new article
module.exports.createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;

  Article.create({
    keyword, title, text, date, source, link, image, owner: req.user._id,
  })
    .then((article) => res.send({ data: article }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new ErrorHandler(ERROR_CODES.invalidData, ERROR_MESSAGES.invalidData);
      }
    })
    .catch(next);
};

//  delete article
module.exports.deleteArticle = (req, res, next) => {
  // res.send(req.params);
  Article.findById(req.params.id)
    .orFail()
    .then((article) => {
      if (req.user._id === article.owner._id.toString()) {
        Article.deleteOne(article).then((deleted) => res.send(deleted));
      } else if (!article) {
        throw new ErrorHandler(ERROR_CODES.notFound, ERROR_MESSAGES.notFound);
      } else {
        throw new ErrorHandler(ERROR_CODES.forbidden, ERROR_MESSAGES.forbidden);
      }
    })
    .catch((err) => {
      next(err);
    })
    .catch(next);
};
