'use strict';

module.exports = function (config) {
  return {
    interests: require('./interests')(config),
    destinations: require('./destinations')(config)
  };
};
