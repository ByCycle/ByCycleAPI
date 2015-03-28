'use strict';

module.exports = {
  vBLocationToCordArray: vBLocationToCordArray
};

function vBLocationToCordArray(loc) {
  loc.location = [loc.location.lat, loc.location.lng];
  return loc;
}
