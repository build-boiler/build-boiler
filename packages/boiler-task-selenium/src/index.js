// Libraries
import _ from 'lodash';
// Packages
import boilerUtils from 'boiler-utils';
// Helpers
import getTestConfig from './get-test-config';
import seleniumOptions from './selenium-standalone/options';
import getBrowserStackOptions from './browser-stack/get-browser-stack-options';
import getCapabilities from './get-capabilities';
import spawn from './runner/spawn';


const {buildLogger, thunk, runGen, runParentFn, gulpTaskUtils} = boilerUtils;
const {logError} = gulpTaskUtils;
const {log} = buildLogger;

export default function(gulp, plugins, config) {
  return (gulpCb) => {
    const {desktop, mobile, configFile, metaData, utils} = config;
    const {getTaskName} = utils;

    function exit(code, cb) {
      if (typeof gulpCb === 'function') {
        gulpCb();
      }

      process.exit(code);
    }

    const taskName = getTaskName(metaData);
    const forceTunnel = taskName === 'tunnel';
    const tunnelOnly = forceTunnel && _.isUndefined(desktop) && _.isUndefined(mobile);
    const runnerOptions = getTestConfig(configFile);
    const {testEnv, testConfig} = getCapabilities(config, runnerOptions, forceTunnel);
    const browserStackOptions = getBrowserStackOptions(config);

    const testData = {
      testEnv,
      ...seleniumOptions,
      ...browserStackOptions,
      ...testConfig
    };
    const {data} = runParentFn(arguments, {data: testData});
    Object.assign(testData, data);

    function startRunner(cb) {
      spawn(testConfig, runnerOptions, config, cb);
    }

    /**
     * Two possibilities
     * a) `testEnv === 'tunnel'` Browser tests must be run on BrowserStack
     * b) `task === 'tunnel'` the command was `gulp selenium:tunnel` for "Live" preview on BrowserStack
     */
    if (testEnv === 'tunnel' || taskName === 'tunnel') {
      const BrowserStackTunnel = require('browserstacktunnel-wrapper');
      const browserStackTunnel = new BrowserStackTunnel(browserStackOptions.spawnTunnelOptions);
      browserStackTunnel.on('started', () => log(browserStackTunnel.stdoutData));

      runGen(function *() {
        let startTunnel = thunk(browserStackTunnel.start, browserStackTunnel);
        try {
          yield startTunnel();
        } catch (err) {
          logError({err, plugin: '[tunnel start]'});
        }

        if (tunnelOnly) {
          log('Visit BrowserStack Live to QA: https://www.browserstack.com/start');
        } else {
          let cp = thunk(startRunner);
          let code = yield cp();
          let stopTunnel = thunk(browserStackTunnel.stop, browserStackTunnel);

          try {
            yield stopTunnel();
          } catch (err) {
            logError({err, plugin: '[tunnel stop]'});
          }

          exit(code);
        }
      });
    } else if (testEnv === 'local') {
      const selenium = require('selenium-standalone');
      const install = require('./selenium-standalone/install');

      runGen(function *() {
        let seleniumInstall = thunk(install);
        try {
          yield seleniumInstall(seleniumOptions.installOptions);
        } catch (err) {
          logError({err, plugin: '[selenium install]'});
        }

        let seleniumStart = thunk(selenium.start, selenium);
        let child;

        try {
          child = yield seleniumStart(seleniumOptions.startOptions);
        } catch (err) {
          logError({err, plugin: `[selenium start]: ${err.message} => pkill java`});
        }

        let cp = thunk(startRunner);
        let code = yield cp();

        try {
          child.kill();
        } catch (err) {
          logError({err, plugin: '[selenium: local server kill]'});
        }
        exit(code);
      });
    } else if (testEnv === 'ci') {
      runGen(function *() {
        let cp = thunk(startRunner);
        let code = yield cp();

        exit(code);
      });
    } else {
      logError({err: new Error('Your test environment was not defined'), plugin: '[selenium]'});
    }
  };
}
