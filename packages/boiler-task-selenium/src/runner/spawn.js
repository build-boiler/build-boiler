// Libraries
import fs from 'fs-extra';
import path from 'path';
// Packages
import boilerUtils from 'boiler-utils';
// Helpers
import runWebdriverio from './webdriverio/run';
import runNightwatch from './nightwatch/run';
import parseNames from './parse-browser-names';


// Temp directory for nightwatch-*.json files (deleted after test runs)
const tmpDir = path.join(__dirname, 'nightwatch', '.tmp');
const {buildLogger, runGen, logError} = boilerUtils;
const {log} = buildLogger;
/**
 * Given a test configuration object, spawn a test runner instance
 *
 * @param {Array} testSettings
 * @param {Object} runnerOptions
 * @param {Object} config // Task configuration
 * @param {Function} cb
 */
export default function spawn(testSettings, runnerOptions, config, cb) {
  const {TRAVIS_BRANCH} = process.env;
  const {runner} = runnerOptions;
  const isNightwatch = runner === 'nightwatch';

  runGen(function *() {
    const codes = [];
    const runCp = isNightwatch ? runNightwatch : runWebdriverio;

    for (const opt of testSettings) {
      const cpOpts = {
        opt,
        runnerOptions,
        config,
        concurrent: !!TRAVIS_BRANCH
      };
      if (isNightwatch) {
        Object.assign(cpOpts, {tmpDir});
      }

      try {
        const {browsers, specs} = parseNames(opt);
        log(`Child process for ${browsers} testing ${specs} starting`);
        const thunkedCp = runCp(cpOpts);
        const code = yield thunkedCp('close');
        codes.push(code);
        log(`Child process for ${browsers} testing ${specs} closed with status: ${code}`);
      } catch (err) {
        logError({err, plugin: 'selenium [spawn]'});
      }
    }

    const errorCodes = codes.filter((code) => code !== 0);
    if (errorCodes.length) {
      cb(errorCodes[0]);
    } else {
      cb(null, 0);
    }
  });

  if (isNightwatch) {
    process.on('exit', () => fs.removeSync(tmpDir));
  }
}
