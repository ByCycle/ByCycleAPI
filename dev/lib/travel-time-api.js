'use strict';

let request = require('request-json');
let moment = require('moment');
let sortBy = require('lodash').sortBy;

module.exports = function (appID, appKey) {
  let client = request.createClient('http://api.travelimeapp.com');
  let requiredParams = {
    app_id: appID,
    app_key: appKey
  };
};

function getRoute(client, requiredParams, origin, maxTime, destinations) {
  let data = extend({}, requiredParams, {
    target: {
      coords: origin,
      mode: 'cycling',
      travel_time: maxTime,
      start_time: moment().add(1, 'hour').toISOString()
    },
    points: destinations
  });

  client.post('v3/routes', data, function (err, res, body) {
    let destsList = Object.keys(body).map(function (id) {
      let dest = body[id];
      dest.id = id;

      return dest;
    });

    return sortBy(destsList, 'time').map(function (dest) {
      d = {};
      d[dest.id] = dest;
      return d;
    });
  });
}
