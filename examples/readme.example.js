var Medusa = require('../index');

function ex() {
  return Medusa.get('sample', function(resolve, reject) {
    console.log('cache miss');
    resolve('example');
  }, 1000);
}


ex().then(res => {
  console.log(res);
});

ex().then(res => {
  console.log(res);
});

ex().then(res => {
  console.log(res);
});
