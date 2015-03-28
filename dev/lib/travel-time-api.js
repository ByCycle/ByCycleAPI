'use strict';

let request = require('request-json');
let moment = require('moment');
let _ = require('lodash');

let sortBy = _.sortBy;
let extend = _.extend;

/* eslint-disable camelcase */
module.exports = function (appID, appKey) {
  let client = request.createClient('http://api.travelimeapp.com');
  let requiredParams = {
    app_id: appID,
    app_key: appKey
  };

  return {
    getRoute: getRoute.bind(null, client, requiredParams)
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

  return new Promise(function (resolve, reject) {
  client.post('v3/routes', data, function (err, res, body) {
    if (err) {
      reject(err);
      return;
    }

      if (res.statusCode !== 200) {
        resolve({
          statusCode: res.statusCode
        });
        return;
      }

    let destsList = Object.keys(body).map(function (id) {
      let dest = body[id];
      dest.id = id;

      return dest;
    });

    destsList = sortBy(destsList, 'time').map(function (dest) {
      let d = {};
      d[dest.id] = dest;
      return d;
    });

    resolve({
      statusCode: 200,
      destinations: destsList
    });
  });
  });
}
