'use strict';

var Medusa = (function() {

  var cache = {};
  var hOP = cache.hasOwnProperty;
  var settings = {
    debug: false,
    returnMutator: false,
  };

  var md = {

    // Alter settings for Medusa
    settings: function(newSettings) {
      if (!newSettings) {
        return settings;
      }

      Object.assign(settings, newSettings);

      return settings;
    },

    // Allows you to get from the cache or pull from the promise
    get: function(key, prom, policy) {

      return new Promise(function(resolve, reject) {

        if (hOP.call(cache, key)) {
          // The cached item exists, return it immediatly
          if (settings.returnMutator) {
            resolve(settings.returnMutator(cache[key].val));
          } else {
            resolve(cache[key].val);
          }

        } else {
          // The cached item does not exist, resolve and return
          let resolveExt = (v) => {
            md.put(key, v, policy);
            if (settings.returnMutator) {
              v = settings.returnMutator(v);
            }
            resolve(v);
          };
          prom(resolveExt, reject)

        }

      });

    },

    // Allows you to get from the cache or pull from the promise
    overwrite: function(key, prom, policy) {

      return new Promise(function(resolve, reject) {

        // Re-put the object no matter what
        let resolveExt = (v) => {
          md.put(key, v, policy);
          if (settings.returnMutator) {
            v = settings.returnMutator(v);
          }
          resolve(v);
        };
        prom(resolveExt, reject)

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
            md._clear(i);
          }
        }
        return true;
      }

      // Clear a wildcard search of objects
      if (key.indexOf('*') > -1) {
        var cacheMatchKeys = Object.keys(cache).filter((str) => {
          return new RegExp('^' + key.split('*').join('.*') + '$').test(str);
        });
        cacheMatchKeys.forEach(md._clear);
        // Incase someone somehow used a wildcard in their cached key (don't do this)
        return cacheMatchKeys.length > 0 || md._clear(key);
      }

      // Not a special clear
      return md._clear(key);

    },

    // Internal clear to bypass extra checking of the key
    _clear(key) {
      // Clear a single item, making sure to remove the extra timeout
      if (hOP.call(cache, key)) {
        if (cache[key].to) {
          clearTimeout(cache[key].to);
        }

        delete cache[key];
        return true;
      }

      return false;
    },

  };

  return md;

})();

// CommonJS binding
if (typeof module === 'object' && module.exports) {
  module.exports = Medusa;
}
