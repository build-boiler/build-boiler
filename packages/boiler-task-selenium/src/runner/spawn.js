// Helpers
import runWebdriverio from './webdriverio/run';
import runNightwatch from './nightwatch/run';


/**
 * Given a test configuration object, spawn a test runner instance
 *
 * @param {Array} capabilities
 * @param {Object} runnerOptions
 * @param {Object} config // Task configuration
 * @param {Function} cb
 */
export default function spawn(capabilities, runnerOptions, config, cb) {
  const run = runnerOptions.runner === 'nightwatch' ? runNightwatch : runWebdriverio;
  run(capabilities, runnerOptions, config, cb);
}
