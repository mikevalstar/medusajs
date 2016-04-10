'use strict';

var Medusa = (function() {

  var cache = {};
  var hOP = cache.hasOwnProperty;
  var settings = {
    debug: false,
    returnMutator: false,
    defaultProvider: 'memory',
  };

  var medusaCore = {

    // Placeholder for cache providers
    providers: {},

    // Alter settings for Medusa
    settings: function(newSettings) {
      if (!newSettings) {
        return settings;
      }

      Object.assign(settings, newSettings);

      return settings;
    },

    // Add a provider
    addProvider: function(name, provider) {
      provider.init(); // Trigger for provider to clear any old cache items or any other cleanup
      medusaCore.providers[name] = provider;
    },

    // Allows you to get from the cache or pull from the promise
    get: function(key, prom, policy) {

      var prov = medusaCore.providers[settings.defaultProvider];

      return prov.get(key, prom, policy)
        .then(function(val) {
          if (settings.returnMutator) {
            return settings.returnMutator(val);
          }

          return val;
        })
        .catch(function() {
          return new Promise(function(resolve, reject) {

            // The cached item does not exist, resolve, store and return
            var resolveExt = function(v) {
              medusaCore.put(key, v, policy);
              if (settings.returnMutator) {
                v = settings.returnMutator(v);
              }
              resolve(v);
            };
            prom(resolveExt, reject);

          });
        });

      /*return new Promise(function(resolve, reject) {

        if (hOP.call(cache, key)) {
          // The cached item exists, return it immediatly
          if (settings.returnMutator) {
            resolve(settings.returnMutator(cache[key].val));
          } else {
            resolve(cache[key].val);
          }

        } else {
          // The cached item does not exist, resolve and return
          var resolveExt = function(v) {
            medusaCore.put(key, v, policy);
            if (settings.returnMutator) {
              v = settings.returnMutator(v);
            }
            resolve(v);
          };
          prom(resolveExt, reject);

        }

      });*/

    },

    // Allows you to get from the cache or pull from the promise
    overwrite: function(key, prom, policy) {

      return new Promise(function(resolve, reject) {

        // Re-put the object no matter what
        var resolveExt = function(v) {
          medusaCore.put(key, v, policy);
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
      medusaCore.clear(key);

      // Set a timemout to self-remove from the cache if in policy
      var to = false;
      if (policy && parseInt(policy) > 0) {
        to = setTimeout(function() {
          medusaCore.clear(key);
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
            medusaCore._clear(i);
          }
        }
        return true;
      }

      // Clear a wildcard search of objects
      if (key.indexOf('*') > -1) {
        var cacheMatchKeys = Object.keys(cache).filter(function(str) {
          return new RegExp('^' + key.split('*').join('.*') + '$').test(str);
        });
        cacheMatchKeys.forEach(medusaCore._clear);
        // Incase someone somehow used a wildcard in their cached key (don't do this)
        return cacheMatchKeys.length > 0 || medusaCore._clear(key);
      }

      // Not a special clear
      return medusaCore._clear(key);

    },

    // Internal clear to bypass extra checking of the key
    _clear: function(key) {
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

  // Memory cache is about the simplist cache possible, use it as an example
  var memoryCache = {

    init: function() {
      // This should be used to update the cache on boot,
      // memory cache will be blank on boot by default
      return;
    },

    get: function(key, policy, callback) {
      // Gets the value as a promise, will resolve on found, will reject if not found
      return new Promise(function(resolve, reject) {

        if (hOP.call(cache, key)) {
          // The cached item exists, return it
          resolve(cache[key].val);
        } else {
          // The cached item does not exist reject
          reject();
        }

      });

    },

    set: function(key, value, prom) {
      // Sets the value, returns a promise when the storage is complete
    },

    keys: function() {
      // Return all keys for the storage
    },

    _hasKey: function(key) {

    },

    clear: function(key) {
      // Clears a single key or complete clear on empty
    },

    _clear: function(key) {
      // Clears a single key
    },

  };

  medusaCore.addProvider('memory', memoryCache);

  return medusaCore;

})();

// CommonJS binding
if (typeof module === 'object' && module.exports) {
  module.exports = Medusa;
}
