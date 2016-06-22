jest.unmock('../../index');
import Medusa from '../../index';

describe('basic storage', () => {

  pit('gets the results of a promise, Date Policy', (resolveFinal, reject) => {

    var x = new Date();
    x = new Date(x.getTime() + 1000 * 1000);

    return Medusa.get('datesample1', function(resolve, reject) {
      resolve('success');
    }, x)
    .then(res => expect(res).toEqual('success'))
    .then(() => { resolveFinal(); })
    .catch(() => {
      reject();
    });

  });

  pit('cache expires', () => {

    return new Promise((resolveFinal, reject) => {

      var x = new Date();
      x = new Date(x.getTime() + 1000 * 1000);

      Medusa.get('datesample2', function(resolve, reject) {
        resolve('failure');
      }, x)
      .then(res => expect(res).toEqual('failure'))
      .then(res => {
        expect(setTimeout.mock.calls.length).toBe(1);
        expect(setTimeout.mock.calls[0][1]).toBe(1000);

        // Fast-forward until all timers have been executed
        jest.runAllTimers();

      })
      .then(res => {
        Medusa.get('datesample2', function(resolve, reject) {
          resolve('success');
        }, 1000)
        .then(res => {
          expect(res).toEqual('success');
          resolveFinal();
        });

      }).catch(() => {
        reject();
      });

    });

  });

});
