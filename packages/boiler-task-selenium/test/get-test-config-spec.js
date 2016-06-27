// Libraries
import {expect} from 'chai';
// Mocks
// Mocks
import wdioConfig from './mocks/wdio.config';
import nightwatchConfig from './mocks/nightwatch.config';
// Helpers
import getTestConfig from '../src/get-test-config';


describe('#getTestConfig()', () => {
  it(`should return the WebdriverIO configuration from test.config.js if none is specified`, () => {
    const config = getTestConfig();
    expect(config).to.deep.equals(wdioConfig);
  });

  it(`should return a Nightwatch configuration if specified`, () => {
    const config = getTestConfig('nightwatch.config.js');
    expect(config).to.deep.equals(nightwatchConfig);
  });

  it(`should return a WebdriverIO configuration if specified`, () => {
    const config = getTestConfig('test.config.js');
    expect(config).to.deep.equals(wdioConfig);
  });
});
