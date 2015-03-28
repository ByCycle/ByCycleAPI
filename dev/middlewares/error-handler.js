'use strict';

module.exports = function (config) {
  let logger = config.logger;

  return function (error, req, res) {
    logger.error(error.stack);
    res.json({ status: 'error', message: error.message });
  };
};
