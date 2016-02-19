var path = require('path');

var message = [
  'This repo is only for testing, it is not intended to be installed. ',
  'If you would like to consume this module please `npm i -D build-boiler@latest ',
  'and to view the source code please go to ' + path.join(__dirname, 'build-boiler')
].join('');

throw new Error(message);

