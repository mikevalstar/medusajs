var storage = window.localStorage;
var storageCache = {

  init: function() {
    // TODO: This should load up the existing local storage items and setup callbacks
    return;
  },

  setStorage: function(engine) {
    storage = engine;
  },

  get: function(key) {
    // Gets the value as a promise, will resolve on found, will reject if not found
    return new Promise(function(resolve, reject) {
      var value = storage.getItem(key);

      if (value) {
        value = JSON.parse(value);
        // The cached item exists, return it
        resolve(value.val);
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
        if (policy && parseInt(policy) > 0) {
          to = setTimeout(function() {
            storageCache.clear(key);
          }, parseInt(policy));

          policy = new Date(Date.now() + parseInt(policy));
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
