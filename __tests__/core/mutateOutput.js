jest.unmock('../../index');
jest.unmock('lodash.clonedeep');
import Medusa from '../../index';
import cloneDeep from 'lodash.clonedeep';

describe('object mutation', () => {

  pit('adds a mutator then uses it', () => {

    Medusa.settings({
      returnMutator: cloneDeep,
    });

    return Medusa.get('mutate1', function(resolve, reject) {
      resolve({x: {v: 'success'}});
    }, 1000)
    .then(res => expect(res.x.v).toEqual('success'))
    .then(res => {
      return Medusa.get('mutate1', function(resolve, reject) {
        resolve('failure');
      }, 1000)
      .then(res => expect(res.x.v).toEqual('success'))
    });

  });

  pit('adds a mutator then uses it on overwrite', () => {

    Medusa.settings({
      returnMutator: cloneDeep,
    });

    return Medusa.get('mutate2', function(resolve, reject) {
      resolve({x: {v: 'success'}});
    }, 1000)
    .then(res => expect(res.x.v).toEqual('success'))
    .then(res => {
      return Medusa.overwrite('mutate2', function(resolve, reject) {
        resolve({x: {v: 'success2'}});
      }, 1000)
      .then(res => expect(res.x.v).toEqual('success2'))
    });

  });


});
