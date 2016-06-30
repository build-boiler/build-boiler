// Libraries
import _ from 'lodash';
import fs from 'fs';
import {basename, join} from 'path';
import globby from 'globby';
import Immutable from 'immutable';
// Helpers
import hackRequire from './hack-require';


/**
 * Construct a glob that matches all existing spec files, given the intended platform(s)
 *
 * @param {Object} config // Task configuration
 *   @param {String} config.sources // Webpack sources
 *   @param {Object} config.utils // Task utility functions
 *   @param {String} config.file // Specific test file names
 *   @param {String} config.mobile // Comma-separated names of mobile browsers
 *   @param {String} config.desktop // Comma-separated names of desktop browsers
 * @param {Object} runnerOptions
 * @return {Array}
 */
export function makeSpecsGlob({sources, utils, file, mobile, desktop}, runnerOptions = {}) {
  const specGlob = '*-spec';
  const {testDir} = sources;
  const {specsDir} = runnerOptions;
  const {addbase} = utils;
  const specsBase = specsDir ? specsDir : join(testDir, 'e2e');
  const hasMobile = fs.existsSync(addbase(specsBase, 'mobile')) && mobile;
  const hasDesktop = fs.existsSync(addbase(specsBase, 'desktop')) && desktop;
  let glob;

  //TODO: remove this conditional once spec files start exporting their browsers/devices
  if (hasMobile && hasDesktop) {
    glob = join(specsBase, `**/${file || specGlob}.js`);
  } else if (hasDesktop) {
    glob = join(specsBase, `{desktop/**/,,!(mobile)/**/}${file || specGlob}.js`);
  } else if (hasMobile) {
    glob = join(specsBase, `{mobile/**/,,!(desktop)/**/}${file || specGlob}.js`);
  } else {
    glob = join(specsBase, `**/${file || specGlob}.js`);
  }

  return glob;
}

/**
 * Redefine require and recursively require all e2e spec files
 *
 * @param {Object} config // Task configuration
 * @param {Object} runnerOptions // Runner options from test.config.js
 *
 * @return {Map}
 */
export default function getTestFiles(config, runnerOptions = {}) {
  const {force, desktop, mobile, utils} = config;
  const {logError} = utils;

  const types = {desktop, mobile};
  const specHook = hackRequire.init(/-spec\.js/, 'specs', types);
  const fp = makeSpecsGlob(config, runnerOptions);
  const globs = globby.sync(fp, {cwd: process.cwd()});
  const filesLen = globs.length;

  if (filesLen === 0) {
    logError({
      err: new Error(`Spec file path not found: ${basename(fp)}`),
      plugin: '[selenium: get-test-files]'
    });
  }

  /**
   * Create an object with keys of filepath and value of all devices exported from the file
   */
  const testFiles = globs.reduce((acc, globFp) => {
    const exportedData = require(globFp);
    const keys = Object.keys(types);
    const typeKeys = keys.filter(key => !!types[key]);
    const hasType = typeKeys.length > 0;
    const typesToTest = hasType ? typeKeys : keys;
    let devices;

    function retrieveDevices(specFileData) {
      return typesToTest.reduce((list, key) => {
        const cliDataByKey = types[key];
        const deviceKey = key === 'desktop' ? 'browserName' : 'device';
        let dataByKey;

        if (_.isBoolean(cliDataByKey)) {
          //if --desktop or --mobile
          dataByKey = cliDataByKey && specFileData[key] ? specFileData[key] : [];
        } else if (specFileData[key]) {
          dataByKey = _.intersection(specFileData[key], _.isArray(cliDataByKey) ? cliDataByKey : []);
        } else {
          dataByKey = [];
        }

        const data = dataByKey.filter(data => {
          let ret = false;

          if (_.isUndefined(cliDataByKey) || cliDataByKey === true) {
            //if there is type data for one type, say desktop, omit the other type
            ret = true;
          } else if (cliDataByKey) {
            let deviceName;

            if (_.isPlainObject(data)) {
              deviceName = data[deviceKey];
            } else if (_.isString(data)) {
              deviceName = data;
            } else {
              logError({
                err: new Error(`data exported from ${globFp} must be of type String or Object`),
                plugin: '[selenium: get-test-files]'
              });
            }

            if (deviceName) {
              ret = cliDataByKey.filter((device) => new RegExp(deviceName.toLowerCase()).test(cliDataByKey.join(' ')));
            }
          }

          return ret;
        });

        return [...list, ...data];
      }, []);
    }

    devices = retrieveDevices(exportedData);

    //if a device is specified `--desktop=ie` and the `-f` (force) flag is specified
    //that device will automatically be added to all files
    if (devices.length === 0 && hasType && force) {
      devices = retrieveDevices(types);
    }

    const devicesByFp = devices.length ? {[globFp]: devices} : {};

    return {
      ...acc,
      ...devicesByFp
    };
  }, {});

  if (Object.keys(testFiles).length === 0) {
    const fps = globs.map(fp => basename(fp)).join(', ');
    logError({
      err: new Error(`No devices found for : ${fps}. Try specifying the --force option`),
      plugin: '[selenium: get-test-files]'
    });
  }

  hackRequire.unmount(specHook);

  const deviceMap = Object.keys(testFiles).reduce((map, fp) => {
    /**
     * the current devices for the fp
     */
    const devices = Immutable.fromJS(testFiles[fp]);
    const accumulator = new Map();

    if (map.size) {

      /**
       * iterate through the devices for the filepath and check
       * if these devices have already been stored
       */
      devices.forEach(device => {
        let prevKey;

       /**
        * iterate through devices and fp's already stored in the map
        * to see if the key already exists on the map
        */
        for (const key of map.keys()) {
          if (Immutable.is(device, key)) {
            prevKey = key;
          }
        }

        if (prevKey) {
          const prevPath = map.get(prevKey);
          //make sure to set by the old key, because if it is an object
          //we need to be able to overwrite it
          accumulator.set(prevKey, prevPath.push(fp));
        } else {
          //if it's a new key (device) then just set it
          accumulator.set(device, Immutable.fromJS([fp]));
        }

      });
    } else {
      /**
       * store all devices by unique key
       */
      devices.forEach(device => {
        accumulator.set(device, Immutable.fromJS([fp]));
      });
    }

    /**
     * don't mutate the original map
     */
    return new Map([
      ...map,
      ...accumulator
    ]);
  }, new Map());


  const suite = new Map();

  /**
   * iterate through the map of
   * single device key (Object || String) => file paths (Immutable.List)
   * and accumulate devices that share file paths
   */
  deviceMap.forEach((fps, device) => {
    let remove;

    suite.forEach((savedFps, deviceList) => {
      if (Immutable.is(fps, savedFps)) {
        remove = deviceList;
      }
    });

    if (suite.size === 0 || _.isUndefined(remove)) {
      suite.set(Immutable.fromJS([device]), fps);
    } else if (remove) {
      suite.delete(remove);
      suite.set(remove.push(device), fps);
    }
  });

  return suite;
}
