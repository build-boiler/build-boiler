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

const opts = {};
// Speed things up even more if we're running parallel tests :)
if (process.argv.indexOf('--parallel') !== -1) {
  Object.assign(opts, {
    maxInstances: 5,
    reporters: '[dot]'
  });
}
exports.config = require('./make-config.js').default(opts);
