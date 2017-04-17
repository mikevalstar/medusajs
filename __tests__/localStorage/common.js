jest.disableAutomock();
import storageObjectProvider from '../../storageObjectProvider';
import MockLocalStorage from 'mock-localstorage';
var mockStorage = new MockLocalStorage();
storageObjectProvider.setStorage(mockStorage);
storageObjectProvider.init(); // Initiate storage object

var policy = () => {
  return {
    expiry: 1000,
  };
};

describe('memoryCache storage', () => {

  it('set an object', () => {

    return storageObjectProvider.set('sample1', 'success', policy())
      .then(res => expect(res).toEqual('success'));

  });

  it('set and gets an object', () => {

    return storageObjectProvider.set('sample2', 'success', policy())
      .then(() => { return storageObjectProvider.get('sample2'); })
      .then(res => expect(res).toEqual('success'));

  });

  it('gets an object thats not there', () => {

    return storageObjectProvider.get('sample3')
      .then(res => expect(false).toEqual(true))
      .catch(res => expect(res).toEqual(false));

  });

  it('clear an object and have it be gone', () => {

    return storageObjectProvider.set('sample4', 'success', policy())
      .then(() => { return storageObjectProvider.get('sample4'); })
      .then(res => expect(res).toEqual('success'))
      .then(() => { return storageObjectProvider.clear('sample4'); })
      .then(() => { return storageObjectProvider.get('sample4'); })
      .then(res => expect(false).toEqual(true))
      .catch(res => expect(res).toEqual(false));

  });

  it('clear all objects and have it be gone', () => {

    return storageObjectProvider.set('sample5', 'success', policy())
      .then(() => { return storageObjectProvider.get('sample5'); })
      .then(res => expect(res).toEqual('success'))
      .then(() => { return storageObjectProvider.clear(); })
      .then(() => { return storageObjectProvider.get('sample5'); })
      .then(res => expect(false).toEqual(true))
      .catch(res => expect(res).toEqual(false));

  });

  it('can get all the keys', () => {

    return storageObjectProvider.set('sample6', 'success', policy())
      .then(() => { return storageObjectProvider.keys(); })
      .then(res => expect(res).toContain('sample6'));

  });

  it('cache expires', () => {

    return storageObjectProvider.set('sample7', 'success', policy())
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

  it('cache expires after we re-load', () => {

    return storageObjectProvider.set('sample9', 'success', policy())
      .then(res => {
        // Fast-forward until all timers have been executed
        jest.clearAllTimers();
        jest.runAllTimers();
      })
      .then(res => {
        storageObjectProvider.get('sample9')
          .then(res => expect(res).toEqual('success'));
        return true;
      })
      .then(res => {
        // Fast-forward until all timers have been executed
        return storageObjectProvider.init();
      })
      .then(res => {
        storageObjectProvider.get('sample9')
          .then(res => expect(res).toEqual('success'));
        return true;
      })
      .then(res => {
        // Fast-forward until all timers have been executed
        jest.runAllTimers();
      })
      .then(res => {
        storageObjectProvider.get('sample9')
          .catch(res => expect(res).toEqual(false));
        return true;
      });

  });


});
