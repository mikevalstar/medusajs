jest.unmock('../index');
import Medusa from '../index';

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

  pit('gets the results of a promise', () => {

    return Medusa.get('sample1', new Promise(function(resolve, reject) {
      resolve('success');
    }), 1000)
    .then(res => expect(res).toEqual('success'));

  });

  pit('returns old value, not new value for promise', () => {

    return new Promise(resolve => {

      Medusa.get('sample2', new Promise(function(resolve, reject) {
        resolve('success');
      }), 1000)
      .then(res => expect(res).toEqual('success'))
      .then(res => {

        Medusa.get('sample2', new Promise(function(resolve, reject) {
          resolve('failure');
        }), 1000)
        .then(res => {
          expect(res).toEqual('success');
          resolve();
        });

      });

    });

  });

  pit('cache expires', () => {

    return new Promise(resolve => {

      Medusa.get('sample3', new Promise(function(resolve, reject) {
        resolve('failure');
      }), 1000)
      .then(res => expect(res).toEqual('failure'))
      .then(res => {

        // Fast-forward until all timers have been executed
        jest.runAllTimers();

      })
      .then(res => {

        Medusa.get('sample3', new Promise(function(resolve, reject) {
          resolve('success');
        }), 1000)
        .then(res => {
          expect(res).toEqual('success');
          resolve();
        });

      });

    });

  });

  pit('rejects and does not cache', () => {

    return new Promise(resolve => {

      Medusa.get('sample4', new Promise(function(resolve, reject) {
        reject('failure');
      }), 1000)
      .catch(err => {

        expect(err).toEqual('failure');

        Medusa.get('sample4', new Promise(function(resolve, reject) {
          resolve('success');
        }), 1000)
        .then(res => {
          expect(res).toEqual('success');
          resolve();
        });

      });

    });

  });

  pit('clears all cache items', () => {

    return new Promise(resolve => {

      Medusa.get('sample5', new Promise(function(resolve, reject) {
        resolve('failure');
      }), 1000)
      .then(() => Medusa.clear())
      .then(res => {

        Medusa.get('sample5', new Promise(function(resolve, reject) {
          resolve('success');
        }), 1000)
        .then(res => {
          expect(res).toEqual('success');
          resolve();
        });

      });

    });

  });

});
