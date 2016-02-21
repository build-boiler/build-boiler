import _, {assign, merge} from 'lodash';
import gutil from 'gulp-util';
import makeWebpackConfig from '../webpack/make-webpack-config';
import filterDevices from './filter-devices';
import bsBrowsers from './browser-stack/browsers';
import bsDevices from './browser-stack/devices.js';

const {colors, log} = gutil;
const {magenta} = colors;

export default function(config) {
  const {
    bsConfig,
    local,
    coverage,
    desktop,
    environment,
    file,
    mobile,
    pkg = {},
    sources,
    utils
  } = config;
  const {isDev, branch} = environment;
  const {addbase} = utils;
  const testPath = addbase(sources.testDir, `config/karma-${coverage ? 'coverage' : 'index'}.js`);
  const customLaunchers = assign({}, bsBrowsers, bsDevices);
  let preprocessors = {};
  let ENV, runnerData;

  if (isDev) {
    preprocessors[testPath] = ['webpack', 'sourcemap'];
    ENV = 'test';
  } else {
    ENV = 'ci';
    preprocessors[testPath] = ['webpack'];
  }

  const webpackConfig = makeWebpackConfig(assign({}, config, {ENV, file}));

  const envConfigs = {
    test: {
      autoWatch: true,
      singleRun: false,
      reporters: ['spec'],
      coverageReporter: {
        reporters: [
          {type: 'lcov', dir: 'coverage/', subdir: '.'},
          {type: 'json', dir: 'coverage/', subdir: '.'},
          {type: 'text-summary'}
        ]
      }
    },
    ci: {
      reporters: local ? ['spec'] : ['dots'],
      //TODO: figure out how to make multiple reports for CI
      coverageReporter: {
        reporters: [
          {type: 'cobertura', dir: 'coverage/', subdir: '.', file: 'cobertura.xml'},
          {type: 'text-summary'}
        ]
      }
    }
  };

  const localDevices = ['chrome', 'firefox', 'safari'];
  const multiDevice = desktop && mobile;
  const nonLocalDevice = _.isArray(desktop) && desktop.filter(device => localDevices.filter(check => new RegExp(check, 'i').test(device)).length === 0);

  if (ENV === 'ci' || multiDevice || nonLocalDevice.length > 0) {
    const {name, version} = pkg;
    const {BROWSERSTACK_API, BROWSERSTACK_USERNAME, localIdentifier} = bsConfig;
    const browsers = filterDevices({desktop, mobile});
    const bsNames = browsers.map(key => {
      const {device, browser} = customLaunchers[key];

      return device || browser;
    }).join(', ');

    log(`Starting Karma integration tests for: ${magenta(bsNames)}`);

    runnerData = {
      autoWatch: false,
      singleRun: true,
      // global config of your BrowserStack account
      browserStack: {
        username: BROWSERSTACK_USERNAME,
        accessKey: BROWSERSTACK_API,
        localIdentifier,
        project: `v${version} [${branch || 'local'}:integration]`,
        build: name,
        name: bsNames
      },
      customLaunchers,
      browsers
    };
  } else {
    runnerData = {
      browsers: _.isArray(desktop) ? desktop.map(_.capitalize) : ['Chrome']
    };
  }

  const envConfig = envConfigs[ENV];

  const karmaConfig = merge({}, envConfig, runnerData, {
    basePath: process.cwd(),
    frameworks: ['mocha', 'sinon'],
    files: [
      'http://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js',
      testPath
    ],
    preprocessors,
    client: {
      captureConsole: false,
      mocha: {
        ui: 'bdd',
        timeout: 10000
      }
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    }
  });

  if (coverage) {
    karmaConfig.reporters.push('coverage');
  }

  return karmaConfig;
}
