jest.unmock('../index');
import Medusa from '../index';

describe('Clear many from storage', () => {

  pit('gets the results of a promise', () => {

    return Medusa.get('clearMany1', function(resolve, reject) {
      resolve('success');
    }, 1000)
    .then(res => expect(res).toEqual('success'))
    .then(res => {
      return Medusa.get('clearMany2', function(resolve, reject) {
        resolve('success');
      }, 1000)
      .then(res => expect(res).toEqual('success'));
    })
    .then(res => {
      return Medusa.clear('clearMany*');
    })
    .then(res => {
      return Medusa.get('clearMany1', function(resolve, reject) {
        resolve('failure');
      }, 1000)
      .then(res => expect(res).toEqual('failure'));
    })
    .then(res => {
      return Medusa.get('clearMany2', function(resolve, reject) {
        resolve('failure');
      }, 1000)
      .then(res => expect(res).toEqual('failure'));
    });

  });

});

describe('Clear many from storage that dont exist', () => {

  pit('gets the results of a promise', () => {

    return Medusa.get('clearMany3', function(resolve, reject) {
      resolve('success');
    }, 1000)
    .then(res => expect(res).toEqual('success'))
    .then(res => {
      return Medusa.get('clearMany4', function(resolve, reject) {
        resolve('success');
      }, 1000)
      .then(res => expect(res).toEqual('success'));
    })
    .then(res => {
      return Medusa.clear('ssssssss*');
    })
    .then(res => {
      return Medusa.get('clearMany3', function(resolve, reject) {
        resolve('failure');
      }, 1000)
      .then(res => expect(res).toEqual('success'));
    })
    .then(res => {
      return Medusa.get('clearMany4', function(resolve, reject) {
        resolve('failure');
      }, 1000)
      .then(res => expect(res).toEqual('success'));
    });

  });

});
