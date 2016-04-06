'use strict';

var Medusa = (function() {

  var cache = {};
  var hOP = cache.hasOwnProperty;
  var settings = {
    debug: false,
  };

  var md = {

    // Alter settings for Medusa
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

    // Allows you to get from the cache or pull from the promise
    get: function(key, prom, policy) {

      return new Promise(function(resolve, reject) {

        if (hOP.call(cache, key)) {
          // The cached item exists, return it immediatly
          resolve(cache[key].val);

        } else {
          // The cached item does not exist, resolve and return
          prom.then((v) => {
            md.put(key, v, policy);
            resolve(v);
          }).catch((e) => {
            reject(e);
          });

        }

      });

    },

    // Place an item into the cache
    put: function(key, value, policy) {

      // Clear in case it exists
      md.clear(key);

      // Set a timemout to self-remove from the cache if in policy
      var to = false;
      if (policy && parseInt(policy) > 0) {
        to = setTimeout(function() {
          md.clear(key);
        }, parseInt(policy));
      }

      // Store the cached item
      cache[key] = {
        policy: policy,
        val: value,
        to: to,
      };

    },

    // Clear one or all items in the cache
    clear: function(key) {

      // Clear all items in the cache
      if (!key) {
        for (var i in cache) {
          if (hOP.call(cache, i)) {
            clearTimeout(cache[i].to);
            delete cache[i];
          }
        }
        return;
      }

      // Clear a single item, making sure to remove the extra timeout
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
