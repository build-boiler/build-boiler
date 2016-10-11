import path from 'path';
import _, {assign, merge} from 'lodash';
import gutil from 'gulp-util';
import makeWebpackConfig from 'boiler-config-webpack';
import boilerUtils from 'boiler-utils';
import makeDeviceFilter from './filter-devices';
import defaultBsBrowsers from './browser-stack/browsers';
import defaultBsDevices from './browser-stack/devices';

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
    karma,
    mobile,
    pkg = {},
    sources,
    utils
  } = config;
  const {transformArray} = boilerUtils;
  const {isDev, isHfa, branch} = environment;
  const {addbase} = utils;
  const {
    browsers: customBrowsers,
    devices: customDevices,
    mocks: parentMocks
  } = karma;
  const testPath = addbase(sources.testDir, `config/karma-${coverage ? 'coverage' : 'index'}.js`);
  const bsBrowsers = _.isPlainObject(customBrowsers) ?
    assign({}, defaultBsBrowsers, customBrowsers) :
    defaultBsBrowsers;
  const bsDevices = _.isPlainObject(customDevices) ?
    assign({}, defaultBsDevices, customDevices) :
    defaultBsDevices;
  const customLaunchers = assign({}, bsBrowsers, bsDevices);
  const preprocessors = {};
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
    const {BROWSERSTACK_API, BROWSERSTACK_USERNAME} = bsConfig;
    const filterDevices = makeDeviceFilter({bsBrowsers, bsDevices});
    const browsers = filterDevices({desktop, mobile});
    const bsNames = browsers.map(key => {
      const {device, browser} = customLaunchers[key];

      return device || browser;
    }).join(', ');

    log(`Starting Karma integration tests for: ${magenta(bsNames)}`);

    runnerData = {
      autoWatch: false,
      singleRun: true,
      captureTimeout: 3e5,
      browserNoActivityTimeout: 3e5,
      browserDisconnectTimeout: 3e5,
      browserDisconnectTolerance: 3,
      // global config of your BrowserStack account
      browserStack: {
        username: BROWSERSTACK_USERNAME,
        accessKey: BROWSERSTACK_API,
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

  const baseMocks = [path.join(__dirname, 'analytics-mocks.js')];
  const normalizedMocks = transformArray(parentMocks, _.isString);
  const mocks = _.union(baseMocks, normalizedMocks);

  karmaConfig.files.unshift(...transformArray(parentMocks));

  if (isHfa) {
    karmaConfig.files.unshift(...mocks);
  } else {
    karmaConfig.files.unshift(...normalizedMocks);
  }

  return karmaConfig;
}
