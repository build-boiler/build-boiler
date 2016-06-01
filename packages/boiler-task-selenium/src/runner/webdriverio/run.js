// Libraries
import _ from 'lodash';
import path, {join} from 'path';
import {spawn} from 'child_process';
// Packages
import boilerUtils from 'boiler-utils';
// Helpers
import parseNames from  './parse-browser-names';


const {buildLogger, thunk, runGen: run} = boilerUtils;
const {log, magenta} = buildLogger;
/**
 * Spawn child process/processes and run tests in parallel/concurrently
 *
 * @param {Array} testSettings
 * @param {Object} runnerOptions
 * @param {Object} config
 * @param {Function} cb
 */
export default function runWebdriverio(testSettings, runnerOptions, config, cb) {
  const {fn: parentFn, local, utils} = config;
  const {addroot, logError} = utils;
  const {TRAVIS_BRANCH} = process.env;

  /**
   * @param {Object} opt E2E options
   * @param {Boolean} local cli arg
   * @param {Boolean} concurrent
   * @return {Function} "thunked" child process
   */
  function runCp(opt, local, concurrent) {
    const {baseUrl} = opt;
    const message = `Starting ${concurrent && testSettings.length > 1 ? 'Concurrent' : 'Parallel'} Tests for [${magenta(baseUrl)}]`;

    log(message);

    const env = _.merge({}, process.env, {
      WDIO_CONFIG: JSON.stringify(opt),
      TEST_ENV: JSON.stringify({local})
    });

    const binPath = join('bin', 'wdio');
    let binaryPath;

    // Try to resolve the path or use the external wdio dependency
    try {
      const webdriverBase = path.dirname(require.resolve('webdriverio'));

      // 'webdriverio/build/bin' --> 'webdriver/bin'
      binaryPath = join(webdriverBase, '..', binPath);
    } catch (err) {
      binaryPath = addroot('node_modules/webdriverio', binPath);
    }

    const cp = _.isFunction(parentFn) ? parentFn.apply(null, arguments) : spawn(
      binaryPath,
      [
        path.join(__dirname),
        '--es_staging'
      ],
      {
        stdio: 'inherit',
        env
      }
    );

    return thunk(cp.on, cp);
  }

  run(function *() {
    if (_.isUndefined(TRAVIS_BRANCH)) {
      let code;

      for (const opt of testSettings) {
        const thunkedCp = runCp(opt);
        const {browsers, specs} = parseNames(opt);

        try {
          code = yield thunkedCp('close');
          log(`Child process for ${browsers} testing ${specs} closed with status: ${code}`);
        } catch (err) {
          logError({err, plugin: '[selenium: spawn]'});
        }
      }

      if (code !== 0) {
        cb(code);
      } else {
        cb(null, code);
      }
    } else {
      const cps = testSettings.reduce((list, opt) => {
        const thunkedCp = runCp(opt, local, true);
        const {browsers, specs} = parseNames(opt);
        const data = {
          thunk: thunkedCp,
          browsers,
          specs
        };

        return [...list, data];
      }, []);

      let codes = [];

      for (const data of cps) {
        const {thunk: thunkedCp, browsers, specs} = data;
        const code = yield thunkedCp('close');
        log(`Child process for ${browsers} testing ${specs} closed with status: ${code}`);
        codes.push(code);
      }

      const flattendCodes = codes.filter(cpCode => cpCode !== 0);

      if (flattendCodes.length) {
        cb(flattendCodes[0]);
      } else {
        cb(null, 0);
      }
    }
  });
}
