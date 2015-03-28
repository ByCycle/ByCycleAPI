'use strict';

let routers = require('express').Router;
let apiBridge = require('../lib/api-bridge-helpers');
let pick = require('lodash').pick;

module.exports = function (config) {
  let router = routers();

  router.get('/:location/:destinationId', function (req, res, next) {
    let location = req.params.location.split(',');
    location = [parseFloat(location[0]), parseFloat(location[1])];

    locationRouteMapper(config, location, req.params.destinationId)
    .then(function (routeDetails) {
      res.json({
        status: 'ok',
        routeDetails: routeDetails
      });
    })
    .catch(function (err) {
      next(err);
    });
  });

  return router;
};

function locationRouteMapper(config, location, destId) {
  let visitBritain = config.visitBritain;
  let travelTime = config.travelTime;

  return visitBritain.location(destId)
  .then(function (loc) {
    if (loc.statusCode !== 200) {
      throw new Error('visit britain provider returned non OK code' + loc.statusCode);
    }

    if (loc.body === null) {
      return null;
    }

    return apiBridge.vBLocationToCordArray(loc.body);
  })
  .then(function (loc) {
    if (loc === null) {
      return null;
    }

    let l = {};
    l[loc.id] = loc.location;

    return travelTime.getRoute(location, 36000, l)
    .then(function (routesResp) {
      if (routesResp.statusCode !== 200) {
        throw new Error('travel time provider returned non OK code ' + routesResp.statusCode);
      }

      if (routesResp.routes.length <= 0) {
        return null;
      }

      let route = routesResp.routes[0];
      let routeDetails = partsToPointsAndDescription(route.parts);
      routeDetails.info = { duration: route.time, distance: route.distance };

      return routeDetails;
    });
  });
}

function partsToPointsAndDescription(parts) {
  let points = [];
  let description = [];

  parts.forEach(function (p) {
    points = points.concat(p.coords.map(function (c) {
      return {
        lat: c[0],
        lng: c[1]
      };
    }));

    let desc = pick(p, ['directions', 'distance', 'time', 'direction', 'road']);
    switch (p.turn) {
      case 'slight_left':
      case 'left':
        desc.arrow = 'ion-arrow-left-c';
      break;
      case 'slight_right':
      case 'right':
        desc.arrow = 'ion-arrow-right-c';
      break;
      default:
        desc.arrow = 'ion-arrow-up-c';
    }

    switch(p.mode) {
      case 'walk':
        desc.mode = 'ion-android-walk';
        break;
      default:
        desc.mode = 'ion-android-bicycle';
    }

    description.push(desc);
  });

  return {
    points: points,
    description: description
  };
}
