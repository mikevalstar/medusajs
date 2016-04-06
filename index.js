'use strict';

var Medusa = (function() {

  var cache = {};
  var hOP = cache.hasOwnProperty;
  var settings = {
    debug: false,
  };

  var md = {

    settings: function(newSettings) {
      if (!newSettings) {
        return settings;
      }

      for (var i in newSettings) {
        if (newSettings.hasOwnProperty(i)) {
          settings[i] = newSettings[i];
        }
      }

      return settings;
    },

    get: function(key, prom, policy) {

      return new Promise(function(resolve, reject) {

        if (hOP.call(cache, key)) {

          resolve(cache[key].val);

        } else {

          prom.then((v) => {
            md.put(key, v, policy);
            resolve(v);
          }).catch((e) => {
            reject(e);
          });

        }

      });

    },

    put: function(key, value, policy) {

      var to = false;
      if (policy && parseInt(policy) > 0) {
        to = setTimeout(function() {
          md.clear(key);
        }, parseInt(policy));
      }

      cache[key] = {
        policy: policy,
        val: value,
        to: to,
      };

    },

    clear: function(key) {

      if (!key) {
        for (var i in cache) {
          if (hOP.call(cache, i)) {
            clearTimeout(cache[i].to);
            delete cache[i];
          }
        }
        return;
      }

      if (hOP.call(cache, key)) {
        if (cache[key].to) {
          clearTimeout(cache[key].to);
        }

        delete cache[key];
      }

    },

  };

  return md;

})();

// CommonJS binding
if (typeof module === 'object' && module.exports) {
  module.exports = Medusa;
}
