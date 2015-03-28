'use strict';

module.exports = {
  vBLocationsToCordArray: vBLocationsToCordArray
};

function vBLocationsToCordArray(locations) {
  return locations.map(function (l) {
    l.location = [l.location.lat, l.location.lng];
    return l;
  });
}
