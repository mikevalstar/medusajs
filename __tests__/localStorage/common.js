jest.disableAutomock();
import storageObjectProvider from '../../storageObjectProvider';
import MockLocalStorage from 'mock-localstorage';
var mockStorage = new MockLocalStorage();
storageObjectProvider.setStorage(mockStorage);
storageObjectProvider.init(); // Simulates

describe('memoryCache storage', () => {

  pit('set an object', () => {

    return storageObjectProvider.set('sample1', 'success', 1000)
      .then(res => expect(res).toEqual('success'));

  });

  pit('set and gets an object', () => {

    return storageObjectProvider.set('sample2', 'success', 1000)
      .then(() => { return storageObjectProvider.get('sample2'); })
      .then(res => expect(res).toEqual('success'));

  });

  pit('gets an object thats not there', () => {

    return storageObjectProvider.get('sample3')
      .then(res => expect(false).toEqual(true))
      .catch(res => expect(res).toEqual(false));

  });

  pit('clear an object and have it be gone', () => {

    return storageObjectProvider.set('sample4', 'success', 1000)
      .then(() => { return storageObjectProvider.get('sample4'); })
      .then(res => expect(res).toEqual('success'))
      .then(() => { return storageObjectProvider.clear('sample4'); })
      .then(() => { return storageObjectProvider.get('sample4'); })
      .then(res => expect(false).toEqual(true))
      .catch(res => expect(res).toEqual(false));

  });

  pit('clear all objects and have it be gone', () => {

    return storageObjectProvider.set('sample5', 'success', 1000)
      .then(() => { return storageObjectProvider.get('sample5'); })
      .then(res => expect(res).toEqual('success'))
      .then(() => { return storageObjectProvider.clear(); })
      .then(() => { return storageObjectProvider.get('sample5'); })
      .then(res => expect(false).toEqual(true))
      .catch(res => expect(res).toEqual(false));

  });

  pit('can get all the keys', () => {

    return storageObjectProvider.set('sample6', 'success', 1000)
      .then(() => { return storageObjectProvider.keys(); })
      .then(res => expect(res).toContain('sample6'));

  });

  pit('cache expires', () => {

    return storageObjectProvider.set('sample7', 'success', 1000)
      .then(res => {
        return storageObjectProvider.set('sample8', 'success')
      })
      .then(res => {
        // Fast-forward until all timers have been executed
        jest.runAllTimers();
      })
      .then(res => {
        storageObjectProvider.get('sample7')
          .then(res => expect(false).toEqual(true))
          .catch(res => expect(res).toEqual(false));
        return true;
      }).then(res => {
        return storageObjectProvider.get('sample8')
          .then(res => expect(res).toEqual('success'))
          .catch(res => expect(false).toEqual(true));
      });

  });


});
