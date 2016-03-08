import 'babel-polyfill';
/**
 * Bootstrap file for Webpack pre-preprocessor utilized in Karma tests
 */
const {TEST_FILE} = process.env;
const re = TEST_FILE !== null ? new RegExp(`${TEST_FILE}.js`) : /-spec\.js$/;
const {ROOT_DIRS} = process.env;

/**
 * require all the test files unless a single file is specified
 */
const testCtx = require.context('../integration', true, /-spec\.js$/);
testCtx.keys().forEach((key) => {
  if (re.test(key)) {
    testCtx(key);
  }
});
