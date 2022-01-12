const { ErrorHandler } = require('../errors/error');

//  errors
const INVALID_DATA_ERROR = 400;
const FORBIDDEN_ERROR = 403;
const NOT_FOUND_ERROR = 404;

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
        throw new ErrorHandler(INVALID_DATA_ERROR, 'Invalid data');
      }
    })
    .catch(next);
};

//  delete article
module.exports.deleteArticle = (req, res, next) => {
  Article.findByIdAndDelete(req.params.id)
    .orFail()
    .then((article) => {
      if (req.user._id === article.owner._id.toString()) {
        Article.deleteOne(article).then((deleted) => res.send(deleted));
      } else if (!article) {
        throw new ErrorHandler(NOT_FOUND_ERROR, 'Card not found');
      } else {
        throw new ErrorHandler(FORBIDDEN_ERROR, 'Only owner can delete this article');
      }
    })
    .catch((err) => {
      next(err);
    })
    .catch(next);
};
