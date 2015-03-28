'use strict';

let routers = require('express').Router;

module.exports = function (config) {
  let router = routers();
  let visitBritain = config.visitBritain;

  router.get('/', function (req, res, next) {
    visitBritain.categories()
    .then(function (categories) {

      if (categories.statusCode !== 200) {
        res.json({
          status: 'error',
          providerStatusCode: categories.statusCode
        });

        return;
      }

      res.json({
        status: 'ok',
        interests: categories.body.map(function (item) {
          return item.title;
        })
      });
    })
    .catch(function (err) {
      next(err, req, res);
    });
  });

  return router;
};
