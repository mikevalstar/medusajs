jest.unmock('../../index');
import Medusa from '../../index';

describe('settings', () => {

  it('returns default settings', () => {

    let retSettigns = Medusa.settings();

    expect(retSettigns.debug).toEqual(false);

  });

  it('can set debug mode', () => {

    let retSettigns = Medusa.settings({
      debug: true,
    });

    expect(retSettigns.debug).toEqual(true);

  });

});

describe('basic storage', () => {

  it('gets the results of a promise', () => {

    return Medusa.get('sample1', function(resolve, reject) {
      resolve('success');
    }, 1000)
    .then(res => expect(res).toEqual('success'));

  });

  it('returns old value, not new value for promise', () => {

    return new Promise(resolve => {

      Medusa.get('sample2', function(resolve, reject) {
        resolve('success');
      }, 1000)
      .then(res => expect(res).toEqual('success'))
      .then(res => {

        Medusa.get('sample2', function(resolve, reject) {
          resolve('failure');
        }, 1000)
        .then(res => {
          expect(res).toEqual('success');
          resolve();
        });

      });

    });

  });

  it('overwtires the current cache item', () => {

    return new Promise(resolve => {

      Medusa.get('sample6', function(resolve, reject) {
        resolve('success');
      }, 1000)
      .then(res => expect(res).toEqual('success'))
      .then(res => {

        Medusa.overwrite('sample6', function(resolve, reject) {
          resolve('success2');
        }, 1000)
        .then(res => {
          expect(res).toEqual('success2');
          resolve();
        });

      });

    });

  });

  it('cache expires', () => {
    return new Promise(resolveP => {

      Medusa.get('sample3', function(resolve, reject) {
        resolve('failure');
      }, 1000)
      .then(res => {
        expect(res).toEqual('failure')
      })
      .then(res => {

        // Fast-forward until all timers have been executed
        jest.runAllTimers();

      })
      .then(res => {

        Medusa.get('sample3', function(resolve, reject) {
          resolve('success');
        }, 1000)
        .then(res => {
          expect(res).toEqual('success');
          resolveP();
        });

      });

    });

  });

  it('rejects and does not cache', () => {

    return new Promise(resolve => {

      Medusa.get('sample4', function(resolve, reject) {
        reject('failure');
      }, 1000)
      .catch(err => {

        expect(err).toEqual('failure');

        Medusa.get('sample4', function(resolve, reject) {
          resolve('success');
        }, 1000)
        .then(res => {
          expect(res).toEqual('success');
          resolve();
        });

      });

    });

  });

  it('clears all cache items', () => {

    return new Promise(resolve => {

      Medusa.get('sample5', function(resolve, reject) {
        resolve('failure');
      }, 1000)
      .then(() => Medusa.clear())
      .then(res => {

        Medusa.get('sample5', function(resolve, reject) {
          resolve('success');
        }, 1000)
        .then(res => {
          expect(res).toEqual('success');
          resolve();
        });

      });

    });

  });

  it('clears a single item that has a permenant cache', () => {

    return new Promise(resolve => {

      Medusa.get('sample7', function(resolve, reject) {
        resolve('failure');
      })
      .then(() => Medusa.clear('sample7'))
      .then(res => {

        Medusa.get('sample7', function(resolve, reject) {
          resolve('success');
        })
        .then(res => {
          expect(res).toEqual('success');
          resolve();
        });

      });

    });

  });

});
