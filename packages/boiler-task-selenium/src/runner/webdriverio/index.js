/**
 * Bootstrap the es6 process here for test files and config
 */
require('babel-register')({
  babelrc: false,
  presets: [require.resolve('babel-preset-es2015-node4')],
  plugins: [
    'add-module-exports',
    'syntax-async-functions',
    'transform-async-to-generator',
    'transform-class-properties',
    'transform-object-rest-spread'
  ],
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
