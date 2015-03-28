'use strict';

module.exports = function (config) {
  return function (req, res, next) {
    res.set('Cache-Control', 'max-age=' + config.cache.maxAge);
    next();
  };
};
