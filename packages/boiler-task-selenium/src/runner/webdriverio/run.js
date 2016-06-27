// Libraries
import _ from 'lodash';
import path, {join} from 'path';
import {spawn} from 'child_process';
// Packages
import boilerUtils from 'boiler-utils';


const {gulpTaskUtils, thunk} = boilerUtils;
const {addroot} = gulpTaskUtils;
export default function runWebdriverio({opt, concurrent, config, runnerOptions}) {
  const {local} = config;

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

  const args = [
    path.join(__dirname),
    '--es_staging'
  ];
  // Signal to make-config to parallelize tests (and use the dot reporter)
  if (opt.host === 'hub.browserstack.com' || opt.capabilities.length > 1) {
    args.push('--parallel');
  }

  const cp = spawn(
    binaryPath,
    args,
    {
      stdio: 'inherit',
      env
    }
  );

  return thunk(cp.on, cp);
}
