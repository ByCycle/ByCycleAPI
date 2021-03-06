'use strict';

module.exports = function (config) {
  let logger = config.logger;

  return function (req, res) {
    logger.info('any route does not match to %s', req.path);
    res.status(404).end();
  };
};
