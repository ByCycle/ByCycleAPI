'use strict';

let routers = require('express').Router;
let pick = require('lodash').pick;

module.exports = function (config) {
  let router = routers();
  let visitBritain = config.visitBritain;

  router.get('/', function (req, res, next) {
    visitBritain.locations()
    .then(function (locations) {

      if (locations.statusCode !== 200) {
        res.json({
          status: 'error',
          providerStatusCode: locations.statusCode
        });

        return;
      }

      res.json({
        status: 'ok',
        destinations: locations.body.map(function (item) {
          return pick(item, ['id', 'title', 'loves', 'images', 'category', 'location', 'images']);
        })
      });
    })
    .catch(function (err) {
      next(err, req, res);
    });
  });

  return router;
};
