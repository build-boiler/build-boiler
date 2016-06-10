// Libraries
import _ from 'lodash';
// Packages
import boilerUtils from 'boiler-utils';
// Configuration
import makeWebdriverioConfig from './runner/webdriverio/make-config';
import makeNightwatchConfig from './runner/nightwatch/make-config';


const {tryExists, buildLogger} = boilerUtils;
const {log} = buildLogger;

/**
 * Given an optional filename, get a test (selenium + runner) configuration
 * NOTE: This defaults to WebdriverIO as the testing framework if none is specified
 *
 * @param {Boolean} testConfigFp // Name of the test configuration file (defaults to 'test.config.js')
 */
export default function getTestConfig(testConfigFp = 'test.config.js') {
  let retVal;

  const testConfig = tryExists(testConfigFp, {lookUp: true});
  if (_.isPlainObject(testConfig)) {
    const {runner} = testConfig;
    if (runner && runner === 'nightwatch') {
      log(`Found Nightwatch config at ${testConfigFp}`);
      retVal = makeNightwatchConfig(testConfig);
    } else {
      log(`Found WebdriverIO config at ${testConfigFp}`);
      retVal = makeWebdriverioConfig(testConfig);
    }
  } else {
    log(`No test config file found -- using default WebdriverIO config`);
    retVal = makeWebdriverioConfig();
  }

  return retVal;
}
