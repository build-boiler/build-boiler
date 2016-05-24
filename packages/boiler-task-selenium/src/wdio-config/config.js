import gutil from 'gulp-util';
import parseNames from '../make-config/parse-browser-names';


const {colors, log} = gutil;
const {magenta, blue} = colors;
const {WDIO_CONFIG} = process.env;
const options = JSON.parse(WDIO_CONFIG);
const {browsers, specs} = parseNames(options);

const baseConfig = {
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
  },

  /**
   * hooks
   */
  onPrepare() {
    log(`WebDriver test runner starting\n${magenta(browsers)} for ${blue(specs)}\n`);
  },
  onComplete() {
    log(`WebDriver test runner finished\n${magenta(browsers)} for ${blue(specs)}\n`);
  }
};

export default  {
  ...baseConfig,
  ...options
};
