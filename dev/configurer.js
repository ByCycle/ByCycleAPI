'use strict';

let winston = require('winston');
let visitBritainAPI = require('./lib/visit-britain-api');
let travelTimeAPI = require('./lib/travel-time-api');

module.exports = function (callback) {
  let config = {
    env: process.env.NODE_ENV || 'development',
    port: 4000,
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
    travelTime: travelTimeAPI('41b58484', 'c7ff6957e616a34acbbadbdbdbed1ac4'),
    visitBritain: visitBritainAPI('A9NsGgd9UmxR')
  };

  callback(null, config);
};
