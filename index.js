'use strict';

var Medusa = (function() {

  var cache = {};
  var currentTasks = {};
  var hOP = cache.hasOwnProperty;

  var settings = {
    debug: false,
    returnMutator: false,
    defaultProvider: 'memory',
    retry: 5000,
  };

  var policyMaker = function(incPolicy) {
    var outPolicy = {
      expiry: false,
      provider: settings.defaultProvider,
    };

    // Blank policy, false, or no policy. lets store forever
    if (!incPolicy) {
      return outPolicy;
    }

    // Type is a full policy object
    if (typeof incPolicy === 'object' && incPolicy.expiry) {
      outPolicy.expiry = incPolicy.expiry;
      outPolicy.provider = incPolicy.provider || outPolicy.provider;
    } else {
      outPolicy.expiry = incPolicy;
    }

    // Date object parsing
    if (outPolicy.expiry.getTime) {
      var d = new Date();
      outPolicy.expiry = Math.ceil((outPolicy.expiry.getTime() - d.getTime()) / 1000);
    }

    // Number is too small, negative or not a number
    outPolicy.expiry = parseInt(outPolicy.expiry) > 0 ? parseInt(outPolicy.expiry) : false;

    return outPolicy;
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

      policy = policyMaker(policy);
      var prov = medusaCore.providers[policy.provider];

      return prov.get(key, prom, policy)
        .then(function(val) {
          if (settings.returnMutator) {
            return settings.returnMutator(val);
          }

          return val;
        })
        .catch(function() {

          if (hOP.call(currentTasks, key) && Array.isArray(currentTasks[key]) && currentTasks[key].length > 0) {
            // Add to the current task, but ignore if any items is below retry anyway threshold
            var oldQueue = false;
            for (var i in currentTasks[key]){
              if(currentTasks[key][i].queued < new Date(Date.now() - settings.retry)){
                oldQueue = true;
              }
            }
            if(!oldQueue){
              var concurent = new Promise(function(resolve, reject) {
                currentTasks[key].push({
                  res: resolve,
                  rej: reject,
                  queued: new Date(),
                });
              });

              return concurent;
            }
          }else{
            // Add current task to list
            currentTasks[key] = [{queued: new Date()}];
          }

          return new Promise(function(resolve, reject) {

            // The cached item does not exist, resolve, store and return
            var resolveExt = function(v) {
              medusaCore.put(key, v, policy);
              if (settings.returnMutator) {
                v = settings.returnMutator(v);
              }
              resolve(v);

              if (hOP.call(currentTasks, key)) {
                for (var i in currentTasks[key]) {
                  if(currentTasks[key][i].res){
                    currentTasks[key][i].res(v);
                  }
                }
                currentTasks[key] = [];
                delete currentTasks[key];
              }
            };

            var rejectExt = function(v){
              reject(v);

              if (hOP.call(currentTasks, key)) {
                for (var i in currentTasks[key]) {
                  if(currentTasks[key][i].rej){
                    currentTasks[key][i].rej(v);
                  }
                }
                currentTasks[key] = [];
                delete currentTasks[key];
              }
            };

            prom(resolveExt, rejectExt);

          });
        });

    },

    // Allows you to get from the cache or pull from the promise
    overwrite: function(key, prom, policy) {

      return new Promise(function(resolve, reject) {

        // Re-put the object no matter what
        var resolveExt = function(v) {
          medusaCore.put(key, v, policyMaker(policy)).then(function(val) {
            if (settings.returnMutator) {
              v = settings.returnMutator(val);
            }
            resolve(val);
          });
        };
        prom(resolveExt, reject);

      });

    },

    // Place an item into the cache
    put: function(key, value, policy) {
      policy = policyMaker(policy);
      var prov = medusaCore.providers[policy.provider];
      return prov.set(key, value, policy);
    },

    // Clear one or all items in the cache
    clear: function(key, provider) {

      var prov = medusaCore.providers[provider || settings.defaultProvider];

      // Clear a wildcard search of objects
      if (key && key.indexOf('*') > -1) {
        return prov.keys().then(function(keys) {
          var cacheMatchKeys = keys.filter(function(str) {
            return new RegExp('^' + key.split('*').join('.*') + '$').test(str);
          });

          var clearPromises = cacheMatchKeys.map(prov.clear);
          // Incase someone somehow used a wildcard in their cached key (don't do this)
          clearPromises.push(prov.clear(key));
          return Promise.all(clearPromises);
        });
      }

      // Not a special clear
      return prov.clear(key);

    },

  };

  // Memory cache is about the simplist cache possible, use it as an example
  var memoryCache = {

    init: function() {
      // This should be used to update the cache on boot,
      // memory cache will be blank on boot by default
      return;
    },

    get: function(key) {
      // Gets the value as a promise, will resolve on found, will reject if not found
      return new Promise(function(resolve, reject) {

        if (hOP.call(cache, key) && cache[key].val) {
          // The cached item exists, return it
          resolve(cache[key].val);
        } else {
          // The cached item does not exist reject
          reject(false);
        }

      });

    },

    set: function(key, value, policy) {
      // Sets the value, returns a promise when the storage is complete, promise will resolve to the value
      // Clear in case it exists
      return memoryCache.clear(key)
        .then(function() {

          // Set a timemout to self-remove from the cache if in policy
          var to = false;
          if (policy && policy.expiry && policy.expiry > 0) {
            to = setTimeout(function() {
              memoryCache.clear(key);
            }, policy.expiry);
          }

          // Store the cached item
          cache[key] = {
            policy: policy,
            val: value,
            to: to,
          };

          return value;

        });
    },

    keys: function() {
      // Return all keys for the storage as a promise
      return new Promise(function(resolve) {
        resolve(Object.keys(cache));
      });
    },

    clear: function(key) {
      return new Promise(function(resolve) {
        // Clears a single key or complete clear on empty
        // Clear all items in the cache
        if (!key) {
          for (var i in cache) {
            memoryCache._clear(i);
          }
          resolve(true);
        }

        resolve(memoryCache._clear(key));
      });
    },

    _clear: function(key) {
      // Clear a single item, making sure to remove the extra timeout
      if (hOP.call(cache, key)) {
        if (cache[key].to) {
          clearTimeout(cache[key].to);
        }

        cache[key] = null;
        delete cache[key];
        return true;
      }

      return false;
    },

  };

  medusaCore.addProvider('memory', memoryCache);

  return medusaCore;

})();

// CommonJS binding
if (typeof module === 'object' && module.exports) {
  module.exports = Medusa;
}
