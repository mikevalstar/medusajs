# medusajs
A Promise based caching library for node or the browser.

Pass in a cache key, a promise executor and optionally a cache length and get back a cached object.

Medusa supports
* Memory storage
* Local / session storage

## Installation

    npm install medusajs

## Usage

```javascript
var Medusa = require('medusajs');

function ex() {
  return Medusa.get('sample', function(resolve, reject) {
    console.log('cache miss');
    resolve('example');
  }, 1000);
}


ex().then(res => {
  console.log(res);
});

ex().then(res => {
  console.log(res);
});

ex().then(res => {
  console.log(res);
});

/* returns:
cache miss
example
example
example */
```

## API

### get = function(key, promise, policy)

The function will lookup and resolve the value for the previously resolved promise,
if no entry is in the cache the function will resolve the promise and resolve that.

_rejected promises are not cached._

The policy value will set the duration of the cache, if no policy is set the object will be cache until cleared manually.

### overwrite = function(key, promise, policy)

The function will resolve the value for the promise and store that result in place of the current object.
The original object will be available while the promise resolves.

_rejected promises are not cached._

The policy value will set the duration of the cache, if no policy is set the object will be cache until cleared manually.

### put = function(key, value, policy)

Bypass the get function and store an object directly into the cache.

### clear = function(key)

Clear a cached item, if no key is set all items will be cleared. Returns a promise that will resolve to true if successful, or an array of booleans for each key;

_You may also clear cache items using a wildcard characters e.g. Medusa.clear('sample*')_

### settings = function(newSettings)

Send in an updated settings object:

* debug: _will output logging_
* returnMutator: _a function to mutate the return value for output (good for using something like lodash.cloneDeep)_

## Policies

### Simple Policy

The simplest policy is to simply set a duration, pass in any integer and the object will be cached for that many seconds.

```javascript
Medusa.get('sample', resolver, 1000).then(res => { console.log(res); });
```

### Date Policy

If you have a specific date and time you would like a cache item to expire, you can pass in a date object

```javascript
var midnight = new Date();
midnight.setHours(24,0,0,0); // midnight
Medusa.get('sample', resolver, midnight).then(res => { console.log(res); });
```

### Complex Policy
If you have something more complex you would like to do with the policy, you can pass in an object with your specifications.

#### Properties
* `expiry`: Date or amount of seconds you would like the cache to expire (**required** but may be set to false)
* `extendOnGet`: Wether or not to extend the cache time if the item is found in the cache

#### Example
```javascript
Medusa.get('sample', resolver, {
  expiry: 1000,
  extendOnGet: true,
}).then(res => { console.log(res); });
```

## Alternate Storage Engines

```javascript
var Medusa = require('medusajs');
var storageCache = require('medusajs/storageObjectProvider');
storageCache.setStorage(window.sessionStorage);

Medusa.addProvider('session', storageCache);
```
