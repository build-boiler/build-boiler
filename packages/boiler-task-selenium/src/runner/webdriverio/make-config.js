// Libraries
import merge from 'lodash/merge';
import SpecReporter from './reporters/spec';


export const wdioDefaults = {
  sync: true,
  maxInstances: 1,
  coloredLogs: true,
  waitforTimeout: 30000,
  framework: 'mocha',
  reporters: [SpecReporter],
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
