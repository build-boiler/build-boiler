/**
 * Bootstrap the es6 process here for test files and config
 */
require('babel-register')({
  presets: ['es2015', 'stage-0'],
  plugins: ['add-module-exports'],
  //tell babel to compile @hfa node_modules
  ignore: /^.+\/node_modules\/(?!@hfa\/).+\.jsx?$/
});
require('babel-polyfill');

exports.config = require('./config.js');
