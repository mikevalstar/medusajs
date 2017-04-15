jest.unmock('../../index');
import Medusa from '../../index';

Medusa.settings({retry: 100});

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

  pit('Clears the concurrent queue properly', () => {

    return new Promise(resolve => {

      jest.useRealTimers();

      var calledCount = 0;

      var incrementor = function(res) {
        setTimeout(()=> {
          res(calledCount += 1);
        }, 1000);
      };

      var t1 = Medusa.get('sampleConcurrentClear', incrementor, 500)
        .then(res => expect(res).toEqual(1));

      var t2 = Medusa.get('sampleConcurrentClear', incrementor, 500)
        .then(res => expect(res).toEqual(1));

      setTimeout(()=> {
        var t3 = Medusa.get('sampleConcurrentClear', incrementor, 1500)
          .then(res => expect(res).toEqual(2));

        //console.error("here 2", setTimeout.mock, jest.useRealTimers);
        jest.runAllTimers();

        Promise.all([t1, t2, t3]).then(() => {
          resolve(true);
        });
      }, 400);

    });

  });

  pit('Only calls the function once, and rejects both', () => {

    return new Promise(resolve => {

      jest.useRealTimers();

      var calledCount = 100;

      var incrementor = function(res, rej) {
        setTimeout(()=> {
          rej(calledCount += 1);
        }, 1000);
      };

      var t1 = Medusa.get('sampleConcurrentrej', incrementor, 1500)
        .then(res => expect(res).toEqual(9999))
        .catch(res => expect(res).toEqual(101));

      var t2 = Medusa.get('sampleConcurrentrej', incrementor, 1500)
        .then(res => expect(res).toEqual(9999))
        .catch(res => expect(res).toEqual(101));

      var t3 = Medusa.get('sampleConcurrentrej', incrementor, 1500)
        .then(res => expect(res).toEqual(9999))
        .catch(res => expect(res).toEqual(101));

      //console.error("here 2", setTimeout.mock, jest.useRealTimers);
      jest.runAllTimers();

      Promise.all([t1, t2, t3]).then(() => {
        resolve(true);
      });

    });

  });

  pit('should cause no issues if an old item is in the queue', () => {

    return new Promise(resolve => {

      jest.useRealTimers();

      var calledCount = 100;

      var incrementor = function(res, rej) {
        setTimeout(()=> {
          rej(calledCount += 1);
        }, 800);
      };

      var t1 = Medusa.get('sampleConcurrentrej', incrementor, 1500)
        .then(res => expect(res).toEqual(9999))
        .catch(res => expect(res).toEqual(101));

      var t2 = Medusa.get('sampleConcurrentrej', incrementor, 1500)
        .then(res => expect(res).toEqual(9999))
        .catch(res => expect(res).toEqual(101));

      setTimeout(()=> {
        var t3 = Medusa.get('sampleConcurrentrej', incrementor, 1500)
          .then(res => expect(res).toEqual(9999))
          .catch(res => expect(res).toEqual(102));

        //console.error("here 2", setTimeout.mock, jest.useRealTimers);
        jest.runAllTimers();

        Promise.all([t1, t2, t3]).then(() => {
          resolve(true);
        });
      }, 300);

    });

  });

});
