import _ from 'lodash';
import path from 'path';
import globby from 'globby';
import hackRequire from './hack-require';
import Immutable from 'immutable';

/**
 * Redefine require and recursively require all e2e spec files
 * @param {Object} payload
 * @param {Object} types mobile/desktop
 * @param {String} fp path to spec files
 *
 * @return {Map}
 */
export default function getTestFiles({types, fp, config}) {
  const {utils, force} = config;
  const {logError} = utils;
  const specHook = hackRequire.init(/-spec\.js/, 'specs', types);
  const globs = globby.sync(fp, {cwd: process.cwd()});
  const filesLen = globs.length;
  const isSingleFile = filesLen === 1;

  if (filesLen === 0) {
    logError({
      err: new Error(`Spec file path not found: ${path.basename(fp)}`),
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
        const typeData = types[key];
        const deviceKey = 'browserName';
        let dataByKey;

        //if the cli args want to test something on a "single file" that is not specifically
        //exported then add it
        if (isSingleFile) {
          const cliDataByKey = types[key];
          dataByKey = _.union(specFileData[key], _.isArray(cliDataByKey) ? cliDataByKey : []);
        } else {
          dataByKey = specFileData[key] || [];
        }

        const data = dataByKey.filter(data => {
          let ret = false;

          if (_.isUndefined(typeData) || typeData === true) {
            //if there is type data for one type, say desktop, omit the other type
            ret = true;
          } else if (typeData) {
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
              ret = typeData.filter(device => new RegExp(deviceName.toLowerCase()).test(typeData.join(' '))).length > 0;
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
    const fps = globs.map(fp => path.basename(fp)).join(', ');
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
