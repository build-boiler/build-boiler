/**
 * Bootstrap the es6 process here for test files and config
 */
require('babel-register')({
  //tell babel to compile @hfa node_modules
  ignore: /^.+\/node_modules\/(?!@hfa\/).+\.jsx?$/
});
require('babel-polyfill');

exports.config = require('./config.js');
