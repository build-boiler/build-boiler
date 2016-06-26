if (!global._babelPolyfill) {
  require('babel-polyfill');
}

const rewirePath = require.resolve('babel-plugin-rewire');

/**
 * Hack to double require `babel-register` and add `rewire` for tests
 */
require('babel-register')({
  plugins: [rewirePath]
});
