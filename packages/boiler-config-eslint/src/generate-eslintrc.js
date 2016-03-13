/**
 * Script to generate a .eslintrc file for use in editors or wherever outside of
 * your application.
 */
import path from 'path';
import fs from 'fs';
import assign from 'object-assign';
import {path as appPath} from 'app-root-path';
import findUp from 'findup-sync';

import config from './eslint-config';
import makeBaseRules from './base-rules';
import makeReactRules from './react-rules';
import boilerUtils from 'boiler-utils';

const {buildLogger} = boilerUtils;
const {log, blue} = buildLogger;
const packageDir = 'packages';
const localPath = findUp(packageDir);
let rcPath;

if (localPath) {
  const [base] = localPath.split(path.sep + packageDir);
  rcPath = path.join(base, '.eslintrc');
} else {
  rcPath = path.join(appPath, '.eslintrc');
}

export default function(opts) {
  let exists = false;

  try {
    const stats = fs.statSync(rcPath);

    exists = stats.isFile();
  } catch (err) {
    exists = false;
  }

  const {react} = opts;
  const baseRules = makeBaseRules({
    ...opts,
    isDev: true
  });
  const reactRules = react ? makeReactRules({isDev: true}) : {};
  const rules = assign({}, baseRules, reactRules);

  if (!exists) {
    log(`Generating .eslintrc to ${blue(rcPath)}`);

    try {
      const content = JSON.stringify(
        assign(config, {rules})
        , null
        , '\t'
      );
      fs.writeFileSync(rcPath, content);
    } catch (err) {
      log('Error generating .eslintrc');
      throw err;
    }
  }
}
