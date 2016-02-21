import gutil from 'gulp-util';
import CustomDots from './dots-reporter';
import parseNames from '../make-config/parse-browser-names';

const {colors, log} = gutil;
const {magenta, blue} = colors;
const {TRAVIS_BRANCH, TEST_ENV, WDIO_CONFIG} = process.env;
const options = JSON.parse(WDIO_CONFIG);
const {local} = JSON.parse(TEST_ENV);
const {browsers, specs} = parseNames(options);

const baseConfig = {
  coloredLogs: true,
  waitforTimeout: 15000,
  framework: 'mocha',
  reporter: TRAVIS_BRANCH && !local ? CustomDots : 'spec',
  reporterOptions: {
    outputDir: './'
  },
  mochaOpts: {
    ui: 'bdd',
    timeout: 15000
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
