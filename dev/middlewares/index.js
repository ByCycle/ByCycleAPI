'use strict';

module.exports = function (config) {
  return {
    requestLogger: require('morgan')(config.middlewares.logger.format, config.middlewares.logger.options),
    bodyParser: require('body-parser').json({ type: 'application/json' }),
    notFoundHandler: require('./not-found-handler')(config),
    errorHandler: require('./error-handler')(config),
    generalCachingPolicy: require('./general-caching-policy')(config),
    cors: require('cors')
  };
};
