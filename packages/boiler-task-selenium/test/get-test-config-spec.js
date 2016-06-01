
// Libraries
import {expect} from 'chai';
// Helpers
import getTestConfig from '../src/get-test-config';


const nightwatchConfig = {
  globals: {
    waitForConditionTimeout: 10000
  },
  output_folder: false,
  selenium_port: 4444,
  selenium_host: 'localhost',
  silent: true,
  screenshots: {
    enabled: false,
    path: ''
  },
  launch_url: '/',
  desiredCapabilities: {
    javascriptEnabled: true,
    acceptSslCerts: true
  },
  specsDir: './test/e2e/nightwatch',
  commandsDir: './test/e2e/nightwatch/commands',
  runner: 'nightwatch'
};

const wdioConfig = {
  specsDir: './test/e2e/wdio',
  commandsDir: './test/e2e/wdio/commands',
  runner: 'wdio',
  sync: true,
  maxInstances: 1,
  coloredLogs: true,
  waitforTimeout: 30000,
  framework: 'mocha',
  reporters: ['dot'],
  reporterOptions: {
    outputDir: './'
  },
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  }
};

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
