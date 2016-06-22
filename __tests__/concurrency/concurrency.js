jest.unmock('../../index');
import Medusa from '../../index';

describe('concurrency', () => {

  pit('Only calls the function once, when the call is slow', () => {

    return new Promise(resolve => {

      jest.useRealTimers();

      var calledCount = 0;

      var incrementor = function(res) {
        setTimeout(()=> {
          res(calledCount += 1);
        }, 1000);
      };

      var t1 = Medusa.get('sampleConcurrent', incrementor, 500)
        .then(res => expect(res).toEqual(1));

      var t2 = Medusa.get('sampleConcurrent', incrementor, 500)
        .then(res => expect(res).toEqual(1));

      //console.error("here 2", setTimeout.mock, jest.useRealTimers);
      jest.runAllTimers();

      Promise.all([t1, t2]).then(() => {
        resolve(true);
      });

    });

  });

});