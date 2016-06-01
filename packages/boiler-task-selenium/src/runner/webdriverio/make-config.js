// Libraries
import merge from 'lodash/merge';


export const wdioDefaults = {
  sync: true,
  maxInstances: 1,
  coloredLogs: true,
  waitforTimeout: 30000,
  framework: 'mocha',
  reporters: ['dot'], // Can only use native DotReporter right now: https://github.com/webdriverio/wdio-spec-reporter/issues/3
  reporterOptions: {
    outputDir: './'
  },
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  }
};

export default function makeWdioConfig(testConfig = {}) {
  const {WDIO_CONFIG = {}} = process.env;
  let options;
  try {
    options = typeof WDIO_CONFIG === 'string' ? JSON.parse(WDIO_CONFIG) : WDIO_CONFIG;
  } catch (e) {
    options = {};
  }

  return merge({}, wdioDefaults, testConfig, options);
}
