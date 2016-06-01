// Libraries
import path from 'path';
import fs from 'fs-extra';
import merge from 'lodash/merge';
import {spawn} from 'child_process';
// Helpers
import {nightwatchDefaults} from './make-config';


/**
 * Spawn child process/processes and run tests in parallel/concurrently
 *
 * @param {Array} testConfig
 * @param {Object} runnerOptions
 * @param {Object} config
 * @param {Function} cb
 */
export default function runNightwatch(testConfig, runnerOptions, config, cb) {
  const {file} = config;
  const {specsDir, commandsDir} = runnerOptions;

  const addSeleniumKeys = (seleniumConfig) => {
    /*eslint dot-notation:0*/
    return Object.keys(seleniumConfig).reduce((acc, key) => {
      const val = seleniumConfig[key];
      switch (key) {
        case 'user':
          if (val) acc.desiredCapabilities['browserstack.user'] = val;
          break;
        case 'key':
          if (val) acc.desiredCapabilities['browserstack.key'] = val;
          break;
        case 'host':
          acc['selenium_host'] = val || 'localhost';
          break;
        case 'port':
          acc['selenium_port'] = val || 4444;
          break;
        case 'logLevel':
          if (val === 'silent') acc[val] = true;
          break;
      }

      return acc;
    }, {
      desiredCapabilities: {}
    });
  };

  const addCaps = (seleniumConfig) => {
    const {baseUrl, specs, capabilities, ...selenium} = seleniumConfig;

    return capabilities.reduce((acc, cap) => {
      const {browserName} = cap;
      const desiredCapabilities = Object.assign({}, cap);

      acc[browserName] = merge({}, nightwatchDefaults, {
        launch_url: baseUrl,
        desiredCapabilities
      }, addSeleniumKeys(selenium));

      return acc;
    }, {});
  };

  const proms = testConfig.reduce((list, seleniumConfig) => {
    const {capabilities, specs} = seleniumConfig;
    const testSettings = addCaps(seleniumConfig);
    const testTargets = capabilities.map(({browserName}) => browserName);
    const fps = specs.map(fp => path.basename(fp, path.extname(fp)));

    testTargets.forEach((target, i) => {
      const configFp = path.resolve(__dirname, `nightwatch-${i}.json`);
      const json = {
        src_folders: [specsDir],
        custom_commands_path: commandsDir,
        output_folder: false,
        test_settings: { [target]: testSettings[target] }
      };
      fs.writeJsonSync(configFp, json);

      const args = {
        config: configFp,
        env: target
      };
      if (file && fps && fps.length) {
        Object.assign(args, {filter: fps.length > 1 ? `{${fps.join(',')}}.js` : `${fps[0]}.js`});
      }

      const prom = new Promise((res, rej) => {
        const child = spawn('node', [
          path.resolve(__dirname, 'runner.js'),
          JSON.stringify(args)
        ], {
          stdio: 'inherit'
        });
        child.on('close', (code) => {
          code ? rej(code) : res(code);
        });
      });
      list.push(prom);
    });

    return list;
  }, []);

  return Promise.all(proms).then(cb).catch((err) => {
    process.exit(1);
  });
}
