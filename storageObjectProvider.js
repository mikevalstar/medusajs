var storage = window.localStorage;
var storageCache = {

  init: function() {
    // This should load up the existing local storage items and setup timed removals
    return new Promise(function(resolve, reject) {

      // Promises for all the set data
      var dataProms = [];

      // Loop through the storage data and attempt to parse each
      for (var i = 0; i < storage.length; i++) {
        var key = storage.key(i);
        var value = storage.getItem(key);
        try {
          value = JSON.parse(value);
          // It will have a false if its a forever object
          if (value && value.policy) {
            var dtn = new Date();

            var diff = Date.parse(value.policy) - dtn.getTime();

            if (diff > 0) {
              dataProms.push(storageCache.set(key, value.val, diff));
            } else {
              storage.removeItem(key);
            }
          }
        } catch (e) {
          // Ignore exceptions, comment is for IE and empty blocks
          // we dont throw because it was probably stored by something else
        }
      }
      Promise.all(dataProms).then(resolve);
    });
  },

  setStorage: function(engine) {
    storage = engine;
  },

  get: function(key) {
    // Gets the value as a promise, will resolve on found, will reject if not found
    return new Promise(function(resolve, reject) {
      var value = storage.getItem(key);

      if (value) {
        try {
          value = JSON.parse(value);
          // The cached item exists, return it
          resolve(value.val);
        } catch (e) {
          reject(false);
        }
      } else {
        // The cached item does not exist reject
        reject(false);
      }

    });

  },

  set: function(key, value, policy) {
    // Sets the value, returns a promise when the storage is complete, promise will resolve to the value
    // Clear in case it exists
    return storageCache.clear(key)
      .then(function() {

        // Set a timemout to self-remove from the cache if in policy
        var to = false;
        if (policy && policy.expiry && policy.expiry > 0) {
          to = setTimeout(function() {
            storageCache.clear(key);
          }, policy.expiry);

          policy = new Date(Date.now() + policy.expiry);
        } else {
          policy = false;
        }

        // Store the cached item
        var strObj = JSON.stringify({
          policy: policy,
          val: value,
          to: to,
        });
        storage.setItem(key, strObj);

        return value;

      });
  },

  keys: function() {
    // Return all keys for the storage as a promise
    return new Promise(function(resolve, reject) {
      var keys = []
      for (var i = 0; i < storage.length; i++) {
        keys.push(storage.key(i));
      }
      resolve(keys);
    });
  },

  clear: function(key) {
    return new Promise(function(resolve, reject) {
      // Clears a single key or complete clear on empty
      // Clear all items in the cache
      if (!key) {
        storage.clear();
        resolve(true);
      }

      resolve(storageCache._clear(key));
    });
  },

  _clear: function(key) {
    var value = storage.getItem(key);
    // Clear a single item, making sure to remove the extra timeout
    if (value) {
      value = JSON.parse(value);
      if (value.to) {
        clearTimeout(value.to);
      }

      storage.removeItem(key);
      return true;
    }

    return false;
  },

};

module.exports = storageCache;
