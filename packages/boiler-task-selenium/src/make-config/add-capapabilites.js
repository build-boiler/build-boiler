import _ from 'lodash';
import Immutable from 'immutable';
import {join} from 'path';
import browsers from '../browser-stack/browsers';
import devices from '../browser-stack/devices';

/**
 * construct test runner objects and add appropriate capabilites
 * @param {Map} map
 * @param {Object} config gulp-config
 * @param {Boolean} forceTunnel force a tunnel environment with `gulp selenium:tunnel`
 * @return {Object}
 *
 * ex {
 *   testEnv: {String} //'local', 'tunnel', 'ci'
 *   data: {Array} // array of test configs to be run via child process
 *
 * }
 */

export default function(map, config, forceTunnel) {
  const {
    bsConfig: browserSyncKeys,
    local,
    sources,
    environment,
    pkg = {},
    utils
  } = config;
  const {name, version} = pkg;
  const {
    devPort,
    testDir,
    devUrl,
    internalHost
  } = sources;
  const {branch, isDevRoot, isMaster} = environment;
  const {logError} = utils;
  const protocol = branch ? 'https://' : 'http://';

  let isLocal,
    testEnv,
    baseUrl;

  const {BROWSERSTACK_USERNAME, BROWSERSTACK_API, localIdentifier} = browserSyncKeys;

  const groupConfig = {
    project: `v${version} [${branch || 'local'}:e2e${local ? ':debug' : ''}]`,
    build: name
  };

  const bsConfig = {
    user: BROWSERSTACK_USERNAME,
    key: BROWSERSTACK_API,
    host: 'hub.browserstack.com',
    port: 80
  };

  /**
   * TODO: potentially account for if we want to run tests against prod url
   * right now master & devel will default to "http://www.hfa.io/contribute/donate/"
   */
  if (branch) {
    const base = `${protocol}${devUrl}`;

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

  const capsConfig = {
    tunnel: {
      'browserstack.local': 'true',
      'browserstack.debug': 'true',
      'browserstack.localIdentifier': localIdentifier
    },
    ci: {
      'browserstack.debug': 'true',
      'browserstack.local': 'true',
      //TODO: make this property dynamic if we have multiple
      //instances of BS binary running for VPC
      'browserstack.localIdentifier': localIdentifier
    }
  };

  const localBrowsers = ['chrome', 'firefox'];

  /**
   * Discover if tests should be run on
   * a) local selenium server
   * b) tunnel on BS
   * c) remote on BS
   */
  if (_.isUndefined(branch)) {
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
    _.assign(baseConfig, bsConfig);
  }

  map.forEach((fps, devices) => {
    const config = capsConfig[testEnv];

    const specs = fps.toJS();
    const capabilities = devices.map(device => {
      let defaultCaps;

      if (Immutable.Map.isMap(device)) {
        defaultCaps = device.toJS();
      } else if (_.isString(device)) {
        //normalize the device name and get it from the default devices
        const deviceArr = allBsDevices.filter(bsDevice => {
          const {browserName, device: configDevice} = bsDevice;
          const re = new RegExp(device, 'i');

          //account for desktop/mobile => i.e. browserName/device
          return re.test(browserName) || re.test(configDevice);
        });

        if (deviceArr.length !== 1) {
          logError({err: new Error(`${device} is not listed in default devices`), plugin: '[selenium: add-capabilities]'});
        }
        defaultCaps = isLocal ? {browserName: device} : deviceArr[0];
      }

      /**
       * Add the configs for BrowserSync test naming
       */
      if (!isLocal) {
        const {browserName, device} = defaultCaps;
        _.assign(defaultCaps, groupConfig, {name: device || browserName});
      }

      return _.assign({}, defaultCaps, config, isLocal);
    }).toJS();

    testConfig.push(_.assign({}, baseConfig, {
      specs,
      capabilities
    }));
  });

  return {
    testEnv,
    testConfig
  };
}
