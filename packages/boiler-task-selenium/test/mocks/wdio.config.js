// Helpers
import SpecReporter from '../../src/runner/webdriverio/reporters/spec';


export default {
  specsDir: './test/e2e/wdio',
  commandsDir: './test/e2e/wdio/commands',
  runner: 'wdio',
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
