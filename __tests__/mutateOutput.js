jest.unmock('../index');
jest.unmock('lodash.clonedeep');
import Medusa from '../index';
import cloneDeep from 'lodash.clonedeep';

describe('object mutation', () => {

  pit('adds a mutator then uses it', () => {

    Medusa.settings({
      returnMutator: cloneDeep,
    });

    return Medusa.get('sample1', function(resolve, reject) {
      resolve({x: {v: 'success'}});
    }, 1000)
    .then(res => expect(res.x.v).toEqual('success'))
    .then(res => {
      return Medusa.get('sample1', function(resolve, reject) {
        resolve('failure');
      }, 1000)
      .then(res => expect(res.x.v).toEqual('success'))
    });

  });

});
