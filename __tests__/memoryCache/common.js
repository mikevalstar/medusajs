jest.unmock('../../index');
import Medusa from '../../index';
var memoryCache = Medusa.providers.memory;


var policy = () => {
  return {
    expiry: 1000,
  };
};

describe('memoryCache storage', () => {

  it('set an object', () => {

    return memoryCache.set('sample1', 'success', policy())
      .then(res => expect(res).toEqual('success'));

  });

  it('set and gets an object', () => {

    return memoryCache.set('sample2', 'success', policy())
      .then(() => { return memoryCache.get('sample2'); })
      .then(res => expect(res).toEqual('success'));

  });

  it('gets an object thats not there', () => {

    return memoryCache.get('sample3')
      .then(res => expect(false).toEqual(true))
      .catch(res => expect(res).toEqual(false));

  });

  it('clear an object and have it be gone', () => {

    return memoryCache.set('sample4', 'success', policy())
      .then(() => { return memoryCache.get('sample4'); })
      .then(res => expect(res).toEqual('success'))
      .then(() => { return memoryCache.clear('sample4'); })
      .then(() => { return memoryCache.get('sample4'); })
      .then(res => expect(false).toEqual(true))
      .catch(res => expect(res).toEqual(false));

  });

  it('clear all objects and have it be gone', () => {

    return memoryCache.set('sample5', 'success', policy())
      .then(() => { return memoryCache.get('sample5'); })
      .then(res => expect(res).toEqual('success'))
      .then(() => { return memoryCache.clear(); })
      .then(() => { return memoryCache.get('sample5'); })
      .then(res => expect(false).toEqual(true))
      .catch(res => expect(res).toEqual(false));

  });

  it('can get all the keys', () => {

    return memoryCache.set('sample6', 'success', policy())
      .then(() => { return memoryCache.keys(); })
      .then(res => expect(res).toContain('sample6'));

  });

  it('cache expires', () => {

    return memoryCache.set('sample7', 'success', policy())
      .then(res => {
        return memoryCache.set('sample8', 'success')
      })
      .then(res => {
        // Fast-forward until all timers have been executed
        jest.runAllTimers();
      })
      .then(res => {
        memoryCache.get('sample7')
          .then(res => expect(false).toEqual(true))
          .catch(res => expect(res).toEqual(false));
        return true;
      }).then(res => {
        return memoryCache.get('sample8')
          .then(res => expect(res).toEqual('success'))
          .catch(res => expect(false).toEqual(true));
      });

  });


});
