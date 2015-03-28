'use strict';

var http = require('http');
var express = require('express');
var debug = require('debug');
var routesConfigurer = require('./routes');
var middlewares = require('./middlewares');

var server = null;

function start(config, callback) {
  var expressApp = express();
  var routes = routesConfigurer(config);
  debug = debug(config.debug.namespace + ':server');

  middlewares = middlewares(config);
  server = http.createServer(expressApp);
  expressApp.set('etag', 'weak');

  expressApp.use(middlewares.generalCachingPolicy);

  Object.keys(routes).forEach(function (route) {
    expressApp.use('/' + route, routes[route]);
  });

  expressApp.use(middlewares.notFoundHandler);
  expressApp.use(middlewares.errorHandler);

  server.listen(config.port, config.ipAddress, function () {
    if (config.ipAddress) {
      debug('Server running on port %s:%s', config.ipAddress, config.port);
    } else {
      debug('Server running on port %s', config.port);
    }

    if (callback) {
      callback();
    }
  });
}

function stop(callback) {
  if (server) {
    server.close(callback);
    server = null;
  } else {
    if (callback) {
      setImmediate(callback());
    }
  }
}

module.exports = {
  start: start,
  stop: stop
};
