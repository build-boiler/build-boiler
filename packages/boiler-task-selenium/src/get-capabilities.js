// Libraries
import _ from 'lodash';
import Immutable from 'immutable';
import {join} from 'path';
// Packages
import boilerUtils from 'boiler-utils';
// Configuration
import browsers from './browser-stack/browsers';
import devices from './browser-stack/devices';
// Helpers
import getBrowserStackOptions from './browser-stack/get-browser-stack-options';


const {gulpTaskUtils, dynamicRequire} = boilerUtils;
const {logError} = gulpTaskUtils;

export default function getCapabilities(config, runnerOptions = {}, forceTunnel) {
  const {environment, sources} = config;
  const {branch, isDevRoot, isMaster} = environment;
  const {devPort, devUrl, internalHost} = sources;
  const {devUrl: devUrlOverride} = runnerOptions;

  const {groupOptions, envOptions, authOptions} = getBrowserStackOptions(config);

  let map = Immutable.Map();
  let isLocal, testEnv, baseUrl;

  try {
    //IMPORTANT: do dynamic require here otherwise `require-hacker` will be
    //working as soon as the file is `import`ed
    const makeTestFiles = dynamicRequire(
      require('./get-test-files')
    );
    map = makeTestFiles(config, runnerOptions);

  } catch (err) {
    logError({err, plugin: '[selenium: get-capabilities]'});
  }

  /**
   * TODO: potentially account for if we want to run tests against prod url
   * right now master & devel will default to "http://www.hfa.io/contribute/donate/"
   */
  const protocol = branch ? 'https://' : 'http://';
  if (branch) {
    const base = devUrlOverride ? devUrlOverride : `${protocol}${devUrl}`;

    if (isDevRoot || isMaster) {
      baseUrl = base;
    } else {
      baseUrl = join(base, branch);
    }
  } else {
    baseUrl = `${protocol}${internalHost}:${devPort}`;
  }

  const baseConfig = {
    baseUrl,
    logLevel: 'silent'
  };

  /**
   * Determine if tests should be run on
   * a) local selenium server
   * b) tunnel on BS
   * c) remote on BS
   */
  if (_.isUndefined(branch)) {
    const localBrowsers = ['chrome', 'firefox'];

    isLocal = true;

    for (const devices of map.keys()) {
      /*eslint-disable*/
      const tunnelDevices = devices.filter(device => localBrowsers.indexOf(device) === -1);
      /*eslint-enable*/

      if (tunnelDevices.size > 0 || forceTunnel) {
        isLocal = false;
        break;
      }
    }

    testEnv = isLocal ? 'local' : 'tunnel';
  } else {
    testEnv = 'ci';
  }

  const allBsDevices = [...browsers, ...devices];
  const testConfig = [];

  if (!isLocal) {
    _.assign(baseConfig, authOptions);
  }

  map.forEach((fps, devices) => {
    const config = envOptions[testEnv];
    const specs = fps.toJS();

    let capabilities = Immutable.List();
    devices.forEach((device) => {
      const addToCapabilities = (caps) => {
        if (!isLocal) {
          const {browserName, device} = caps;
          _.assign(caps, groupOptions, {name: device || browserName});
        }

        capabilities = capabilities.push(_.assign({}, caps, config, isLocal));
      };

      if (Immutable.Map.isMap(device)) {
        addToCapabilities(device.toJS());
      } else if (_.isString(device)) {
        //normalize the device name and get it from the default devices
        const deviceArr = allBsDevices.filter(bsDevice => {
          const {browserName, device: configDevice} = bsDevice;
          const re = new RegExp(device, 'i');

          //account for desktop/mobile => i.e. browserName/device
          return (re.test(browserName) || re.test(configDevice));
        });

        if (deviceArr.length < 1) {
          logError({err: new Error(`${device} is not listed in default devices`), plugin: '[selenium: add-capabilities]'});
        }

        deviceArr.forEach((device) => {
          addToCapabilities(isLocal ? {browserName: device.browserName} : device);
        });
      }
    });

    testConfig.push(_.assign({}, baseConfig, {
      specs,
      capabilities: _.isFunction(capabilities.toJS) ? capabilities.toJS() : capabilities
    }));
  });

  return {
    testEnv,
    testConfig
  };
}
