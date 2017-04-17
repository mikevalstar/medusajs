jest.unmock('../../index');
import Medusa from '../../index';

Medusa.settings({retry: 10});

jest.useRealTimers();

describe('concurrency', () => {

  it('Only calls the function once, when the call is slow', () => {

    return new Promise(resolve => {

      var calledCount = 0;

      var incrementor = function(res) {
        setTimeout(()=> {
          res(calledCount += 1);
        }, 100);
      };

      var t1 = Medusa.get('sampleConcurrent', incrementor, 50)
        .then(res => expect(res).toEqual(1));

      var t2 = Medusa.get('sampleConcurrent', incrementor, 50)
        .then(res => expect(res).toEqual(1));

      Promise.all([t1, t2]).then(() => {
        resolve(true);
      });
      //console.error("here 2", setTimeout.mock, jest.useRealTimers);
      //jest.runAllTimers();

    });

  });

  it('Clears the concurrent queue properly', () => {

    return new Promise(resolve => {

      //jest.useRealTimers();

      var calledCount = 0;

      var incrementor = function(res) {
        setTimeout(()=> {
          res(calledCount += 1);
        }, 100);
      };

      var t1 = Medusa.get('sampleConcurrentClear', incrementor, 50)
        .then(res => expect(res).toEqual(1));

      var t2 = Medusa.get('sampleConcurrentClear', incrementor, 50)
        .then(res => expect(res).toEqual(1));

      setTimeout(()=> {
        var t3 = Medusa.get('sampleConcurrentClear', incrementor, 150)
          .then(res => expect(res).toEqual(2));

        //console.error("here 2", setTimeout.mock, jest.useRealTimers);
        //jest.runAllTimers();

        Promise.all([t1, t2, t3]).then(() => {
          resolve(true);
        });
      }, 40);

    });

  });

  it('Only calls the function once, and rejects both', () => {

    return new Promise(resolve => {

      //jest.useRealTimers();

      var calledCount = 100;

      var incrementor = function(res, rej) {
        setTimeout(()=> {
          rej(calledCount += 1);
        }, 100);
      };

      var t1 = Medusa.get('sampleConcurrentrej', incrementor, 150)
        .then(res => expect(res).toEqual(9999))
        .catch(res => expect(res).toEqual(101));

      var t2 = Medusa.get('sampleConcurrentrej', incrementor, 150)
        .then(res => expect(res).toEqual(9999))
        .catch(res => expect(res).toEqual(101));

      var t3 = Medusa.get('sampleConcurrentrej', incrementor, 150)
        .then(res => expect(res).toEqual(9999))
        .catch(res => expect(res).toEqual(101));

      //console.error("here 2", setTimeout.mock, jest.useRealTimers);
      //jest.runAllTimers();

      Promise.all([t1, t2, t3]).then(() => {
        resolve(true);
      });

    });

  });

  it('should cause no issues if an old item is in the queue', () => {

    return new Promise(resolve => {

      //jest.useRealTimers();

      var calledCount = 100;

      var incrementor = function(res, rej) {
        setTimeout(()=> {
          rej(calledCount += 1);
        }, 80);
      };

      var t1 = Medusa.get('sampleConcurrentrej', incrementor, 150)
        .then(res => expect(res).toEqual(9999))
        .catch(res => expect(res).toEqual(101));

      var t2 = Medusa.get('sampleConcurrentrej', incrementor, 150)
        .then(res => expect(res).toEqual(9999))
        .catch(res => expect(res).toEqual(101));

      setTimeout(()=> {
        var t3 = Medusa.get('sampleConcurrentrej', incrementor, 150)
          .then(res => expect(res).toEqual(9999))
          .catch(res => expect(res).toEqual(102));

        //console.error("here 2", setTimeout.mock, jest.useRealTimers);
        //jest.runAllTimers();

        Promise.all([t1, t2, t3]).then(() => {
          resolve(true);
        });
      }, 30);

    });

  });

});
