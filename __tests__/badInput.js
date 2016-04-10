jest.unmock('../index');
import Medusa from '../index';

describe('handle bad user input', () => {

  pit('cache does not expire with a bad policy', () => {

    return new Promise(resolve => {

      Medusa.get('sampleBA1', function(resolve, reject) {
        resolve('success');
      }, 'this is not valid!')
      .then(res => expect(res).toEqual('success'))
      .then(res => {

        // Fast-forward until all timers have been executed
        jest.runAllTimers();

      })
      .then(res => {

        Medusa.get('sampleBA1', function(resolve, reject) {
          resolve('failure');
        }, 'this is not valid!')
        .then(res => {
          expect(res).toEqual('success');
          resolve(); // Resolve pit
        });

      });

    });

  });

});
