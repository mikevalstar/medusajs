# medusajs
A Promise based caching library for node or the browser.

Pass in a cache key, a promise executor and optionally a cache length and get back a cached object.

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

### put = function(key, value, policy)

Bypass the get function and store an object directly into the cache.

### clear = function(key)

Clear a cached item, if no key is set all items will be cleared. Returns true if an item was cleared.

_You may also clear cache items using a wildcard characters e.g. Medusa.clear('sample*')_

### settings = function(newSettings)

Send in an updated settings object:

* debug: _will output logging_
