// Libraries
import path from 'path';
import fs from 'fs-extra';
import merge from 'lodash/merge';
import {spawn} from 'child_process';
import EventEmitter from 'events';
// Packages
import boilerUtils from 'boiler-utils';
// Helpers
import {nightwatchDefaults} from './make-config';


const {thunk} = boilerUtils;
export default function runNightwatch({opt, concurrent, config, runnerOptions, tmpDir}) {
  const {specsDir, commandsDir} = runnerOptions;
  const {customSettings = {}} = runnerOptions;
  // Prepare the temp directory for nightwatch-*.json files
  fs.mkdirsSync(tmpDir);

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

  const {capabilities, specs} = opt;
  const testSettings = addCaps(opt);
  const testTargets = capabilities.map(({browserName}) => browserName);
  const fps = specs.map((fp) => path.basename(path.relative(specsDir, fp), path.extname(fp)));

  // EventEmitter wrapper around multiple Nightwatch child processes to mimic single-cp interface
  const emitter = new EventEmitter();
  function onPromisesDone(code) {
    emitter.emit('close', code);
  }

  const promises = [];
  testTargets.forEach((target) => {
    const configFp = path.resolve(tmpDir, `nightwatch-${target}-${new Date().getTime()}.json`);
    const json = {
      src_folders: [specsDir],
      custom_commands_path: commandsDir,
      output_folder: false,
      test_settings: {[target]: Object.assign({}, testSettings[target], customSettings)}
    };
    fs.writeJsonSync(configFp, json);

    const args = {
      config: configFp,
      env: target
    };

    if (fps && fps.length) {
      Object.assign(args, {filter: fps.length > 1 ? `{${fps.join(',')}}.js` : `${fps[0]}.js`});
    }

    const promise = new Promise((res, rej) => {
      const cp = spawn('node', [
        path.resolve(__dirname, 'runner.js'),
        JSON.stringify(args)
      ], {
        stdio: 'inherit'
      });
      cp.on('close', (code) => {
        code ? rej(code) : res(code);
      });
    });
    promises.push(promise);
  });


  Promise.all(promises)
    .then(() => onPromisesDone(0))
    .catch((code) => onPromisesDone(code));

  return thunk(emitter.on, emitter);
}
