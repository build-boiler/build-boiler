import _ from 'lodash';
import fs from 'fs';
import {join} from 'path';
import getTask from './get-task';
import addCaps from './add-capapabilites';

export default function({config, gulp}) {
  const SELENIUM_VERSION = '2.53.0';
  const {
    bsConfig,
    file,
    sources,
    desktop,
    mobile,
    utils
  } = config;
  const {devHost, devPort, hotPort, testDir} = sources;
  const {addbase, logError} = utils;
  const specGlob = '*-spec';
  const {task} = getTask({gulp, utils});
  const {localIdentifier} = bsConfig;
  const spawnOpts = {
    version: SELENIUM_VERSION,
    spawnOptions: {
      stdio: 'ignore'
    }
  };

  const spawnTunnelOpts = {
    key: process.env.BROWSERSTACK_API,
    hosts: [
      {
        name: devHost,
        port: devPort,
        sslFlag: 0
      },
      {
        name: devHost,
        port: hotPort,
        sslFlag: 0
      }
    ],
    v: true,
    localIdentifier,
    forcelocal: true
  };

  const noDevicesSpecified = _.isUndefined(desktop) && _.isUndefined(mobile);
  const isTunnel = task === 'tunnel';
  let ret;

  if (isTunnel && noDevicesSpecified) {
    ret = {
      task,
      tunnelOnly: true,
      spawnTunnelOpts
    };
  } else {
    const devices = {mobile, desktop};
    const hasMobile = fs.existsSync(addbase(testDir, 'e2e', 'mobile')) && mobile;
    const hasDesktop = fs.existsSync(addbase(testDir, 'e2e', 'desktop')) && desktop;
    let capsConfigMap, specs;

    //TODO: remove this conditional once spec files start exporting their browsers/devices
    if (hasMobile && hasDesktop) {
      specs = join(testDir, `e2e/**/${file || specGlob}.js`);
    } else if (hasDesktop) {
      specs = join(testDir, `e2e/{desktop/**/,,!(mobile)/**/}${file || specGlob}.js`);
    } else if (hasMobile) {
      specs = join(testDir, `e2e/{mobile/**/,,!(desktop)/**/}${file || specGlob}.js`);
    } else {
      specs = join(testDir, `e2e/**/${file || specGlob}.js`);
    }

    //IMPORTANT: do dynamic require here otherwise `require-hacker` will be
    //working as soon as the file is `import`ed
    try {
      const getTestFiles = require('./get-test-files');
      capsConfigMap = getTestFiles({types: devices, fp: specs, config});
    } catch (err) {
      logError({err, plugin: '[selenium: get-test-files]'});
    }

    const testConfig = addCaps(capsConfigMap, config, isTunnel);

    const installOpts = {
      version: SELENIUM_VERSION
    };

    /****Return Object Schema******************************************
        {
          installOpts: { version: '2.47.0' },
          spawnOpts: { version: '2.47.0', spawnOptions: { stdio: 'ignore' } },
          spawnTunnelOpts:
          { key: 'q2ymy1CSqKLge63HZqHc',
          hosts: [ [Object], [Object] ],
          v: true,
          forcelocal: true },
          testEnv: 'ci',
          testConfig:
          [ { baseUrl: 'www.hfa.io/frontend-boilerplate',
          project: '@hfa/frontend-boilerplate',
          build: 'hello',
          name: 'e2e',
          host: 'hub.browserstack.com',
          port: 80,
          user: 'dtothefp1',
          key: 'q2ymy1CSqKLge63HZqHc',
          logLevel: 'silent',
          specs: [Array],
          capabilities: [Object] },
          { baseUrl: 'www.hfa.io/frontend-boilerplate',
          project: '@hfa/frontend-boilerplate',
          build: 'hello',
          name: 'e2e',
          host: 'hub.browserstack.com',
          port: 80,
          user: 'dtothefp1',
          key: 'q2ymy1CSqKLge63HZqHc',
          logLevel: 'silent',
          specs: [Array],
          capabilities: [Object] } ],
          suffix: undefined
        }
    ******************************************************************/

    ret = {
      installOpts,
      spawnOpts,
      spawnTunnelOpts,
      ...testConfig,
      task
    };
  }

  return ret;
}
