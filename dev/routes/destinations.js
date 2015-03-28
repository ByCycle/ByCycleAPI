'use strict';

let routers = require('express').Router;
let pick = require('lodash').pick;
let apiBridge = require('../lib/api-bridge-helpers');

module.exports = function (config) {
  let router = routers();

  router.get('/', function (req, res, next) {
    let params = req.query;
    params.location = params.location.split(',');
    let location = [parseFloat(params.location[0]), parseFloat(params.location[1])];
    let maxDuration = parseInt(params.maxDuration);

    locationsRouteMapper(config, location, params.interest, maxDuration)
    .then(function (locations) {
      res.json({
        status: 'ok',
        destinations: locations
      });
    })
    .catch(function (err) {
      next(err, req, res);
    });
  });

  return router;
};

function locationsRouteMapper(config, location, interest, maxDuration) {
  let visitBritain = config.visitBritain;
  let travelTime = config.travelTime;

  return visitBritain.locations(location[0], location[1])
  .then(function (locations) {
    if (locations.statusCode !== 200) {
      throw new Error('visit britain provider returned non OK code' + locations.statusCode);
    }

    locations = locations.body;
    locations = locations.filter(function (l) {
      return l.category.title.toLowerCase() === interest.toLowerCase();
    });

    locations = locations.map(function (l) {
      l = pick(l, ['id', 'title', 'loves', 'images', 'category', 'location', 'images']);
      return apiBridge.vBLocationToCordArray(l);
    });

    return locations;
  })
  .then(function (locations) {
    let locs = {};
    let locMap = new Map();

    locations.forEach(function (l) {
      let key = 'n' + l.id;
      locs[key] = l.location;
      locMap.set(key, l);
    });

    return travelTime.getRoute(location, maxDuration, locs)
    .then(function (routesResp) {
      if (routesResp.statusCode !== 200) {
        throw new Error('travel time provider returned non OK code ' + routesResp.statusCode);
      }

      return routesResp.routes.map(function (r) {
        let l = locMap.get(r.id);
        l.duration = r.time;
        l.distance = r.distance;

        return l;
      });
    });
  });
}
