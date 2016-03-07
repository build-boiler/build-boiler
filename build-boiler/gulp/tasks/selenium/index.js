import {log} from 'gulp-util';
import spawn from './spawn-process';
import makeConfig from './make-config';
import thunk from '../../utils/thunk';
import run from '../../utils/run-gen';
import callParent from '../../utils/run-parent-fn';

export default function(gulp, plugins, config) {
  const {utils} = config;
  const {logError} = utils;

  return (gulpCb) => {
    const testData = makeConfig({config, gulp});
    const parentConfig = callParent(arguments, {data: testData});
    const {
      data = testData,
      fn
    } = parentConfig;
    const {
      testEnv,
      installOpts,
      spawnOpts,
      spawnTunnelOpts,
      testConfig,
      task,
      tunnelOnly
    } = data;

    function runWebdriver(cb) {
      return spawn(testConfig, {
        ...config,
        fn
      }, cb);
    }

    function logStatus(code) {
      process.exit(code);
      gulpCb();
    }

    /**
     * Two possibilities
     * a) `testEnv === 'tunnel'` Browser tests must be run on BrowserStack
     * b) `task === 'tunnel'` the command was `gulp selenium:tunnel` for "Live" preview on BrowserStack
     */
    if (testEnv === 'tunnel' || task === 'tunnel') {
      const BrowserStackTunnel = require('browserstacktunnel-wrapper');
      /**
       * gulp selenium:tunnel
       * Start a Browserstack tunnel to allow using local IP's for
       * Browserstack tests (Automate) and live viewing (Live)
       */
      const browserStackTunnel = new BrowserStackTunnel(spawnTunnelOpts);

      browserStackTunnel.on('started', () => {
        log(browserStackTunnel.stdoutData);
      });

      run(function *() {
        let startTunnel = thunk(browserStackTunnel.start, browserStackTunnel);
        try {
          yield startTunnel();
        } catch (err) {
          logError({err, plugin: '[tunnel start]'});
        }

        if (tunnelOnly) {
          log('Visit BrowserStack Live to QA: https://www.browserstack.com/start');
        } else {
          let cp = thunk(runWebdriver);
          let code = yield cp();
          let stopTunnel = thunk(browserStackTunnel.stop, browserStackTunnel);

          try {
            yield stopTunnel();
          } catch (err) {
            logError({err, plugin: '[tunnel stop]'});
          }

          logStatus(code);
        }
      });
    } else if (testEnv === 'local') {
      const selenium = require('selenium-standalone');
      const install = require('./install');

      run(function *() {
        let seleniumInstall = thunk(install);
        try {
          yield seleniumInstall(installOpts);
        } catch (err) {
          logError({err, plugin: '[selenium install]'});
        }

        let seleniumStart = thunk(selenium.start, selenium);
        let child;

        try {
          child = yield seleniumStart(spawnOpts);
        } catch (err) {
          logError({err, plugin: `[selenium start]: ${err.message} => pkill java`});
        }

        let cp = thunk(runWebdriver);
        let code = yield cp();

        try {
          child.kill();
        } catch (err) {
          logError({err, plugin: '[selenium: local server kill]'});
        }
        logStatus(code);
      });
    } else if (testEnv === 'ci') {
      run(function *() {
        let cp = thunk(runWebdriver);
        let code = yield cp();

        logStatus(code);
      });
    } else {
      logError({err: new Error('Your test environment was not defined'), plugin: '[selenium]'});
    }
  };
}
