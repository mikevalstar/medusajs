jest.unmock('../index');
import Medusa from '../index';

describe('Clear many from storage', () => {

  pit('gets the results of a promise', () => {

    return Medusa.get('sample1', function(resolve, reject) {
      resolve('success');
    }, 1000)
    .then(res => expect(res).toEqual('success'))
    .then(res => {
      return Medusa.get('sample2', function(resolve, reject) {
        resolve('success');
      }, 1000)
      .then(res => expect(res).toEqual('success'));
    })
    .then(res => {
      return Medusa.clear('samp*');
    })
    .then(res => {
      return Medusa.get('sample1', function(resolve, reject) {
        resolve('failure');
      }, 1000)
      .then(res => expect(res).toEqual('failure'));
    })
    .then(res => {
      return Medusa.get('sample2', function(resolve, reject) {
        resolve('failure');
      }, 1000)
      .then(res => expect(res).toEqual('failure'));
    });

  });

});
