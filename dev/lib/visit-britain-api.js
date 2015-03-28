'use strict';

let querystring = require('querystring');
let request = require('request-json');
let extend = require('lodash').extend;

module.exports = function (apiKey) {
  var client = apiClient(apiKey);

  return {
    categories: client.single.bind(client, 'items', { type: 'category', limit: 20 }),
    locations: function(lat, lon) {
      return client.batch('items', 100, { type: 'location', near: `${lon},${lat}`, limit: 50 });
    },
    location: function (id) {
      return client.single('items', { type: 'location', ids: id })
      .then(function (l) {
        if (l.body.length > 0) {
          l.body = l.body[0];
        } else {
          l.body = null;
        }

        return l;
      });
    }
  };
};

function apiClient(apiKey) {
  let client = request.createClient('http://api.visitbritain.com/');
  let requiredQueryParams = { lang: 'en', t: apiKey };

  return {
    batch: function (path, total, queryObj) {
      if ((typeof queryObj.limit !== 'number') && (queryObj.limit <= 0)) {
        return Promise.reject(new Error('query must contains limit and must be a number greater than 0'));
      }

      return batch(this, path, total, queryObj).then(function (batches) {
        let all = [];

        batches.forEach(function (b) {
          all = all.concat(b);
        });

        return {
          statusCode: 200,
          body: all
        };
      });
    },
    single: function (path, queryObj) {
      return new Promise(function (resolve, reject) {
        let query = querystring.stringify(extend({}, requiredQueryParams, queryObj));

        client.get(`${path}?${query}`, function (err, res, body) {
          if (err) {
            reject(err);
            return;
          }

          resolve({
            statusCode: res.statusCode,
            body: body.data
          });
        });
      });
    }
  };
}

function batch(client, path, total, queryObj) {
  let promises = [];
  for (let i = 0; i < total; i++) {
    let query = extend({ skip: queryObj.limit * i }, queryObj);
    /* eslint-disable no-loop-func */
    let promise = client.single(path, query).then(function (b) {
      if (b.statusCode !== 200) {
        throw new Error('some request of the batch return a non 200 status code');
      }

      return b.body;
    });

    promises.push(promise);
  }

  return Promise.all(promises);
}
