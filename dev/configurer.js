'use strict';

let winston = require('winston');
let visitBritainAPI = require('./lib/visit-britain-api');
let travelTimeAPI = require('./lib/travel-time-api');

module.exports = function (callback) {
  let config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 4000,
    debug: {
      namespace: 'visitbritain-hack'
    },
    cache: {
      maxAge: 60 // seconds
    },
    middlewares: {
      logger: {
        format: 'combined'
      }
    },
    logger: winston,
    travelTime: travelTimeAPI(process.env.TRAVEL_TIME_API_KEY,
                              process.env.TRAVEL_TIME_API_SECRET),
    visitBritain: visitBritainAPI(process.env.VISIT_BRITAIN_API_KEY)
  };

  callback(null, config);
};
