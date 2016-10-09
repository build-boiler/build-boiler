import path from 'path';
import fs from 'fs';
import findUp from 'findup-sync';
import merge from 'lodash/merge';
import config from './config/web-dev';
import boilerUtils from 'boiler-utils';

const {buildLogger} = boilerUtils;
const {log, blue} = buildLogger;
const packageDir = 'packages';
const localPath = findUp(packageDir);

/**
 * Script to generate a .eslintrc file for use in editors or wherever outside of
 * your application.
 */
export default function(opts) {
  const {
    rootPath,
    rules = {}
  } = opts;
  let rcPath;

  if (localPath) {
    const [base] = localPath.split(path.sep + packageDir);

    rcPath = path.join(base, '.eslintrc');
  } else {
    rcPath = rootPath || path.join(process.cwd(), '.eslintrc');
  }

  log(`Generating .eslintrc to ${blue(rcPath)}`);

  merge(config, {
    rules: rules.web || rules
  });

  const content = JSON.stringify(config, null, '\t');

  try {
    fs.writeFileSync(rcPath, content);
  } catch (err) {
    log('Error generating .eslintrc');
    throw err;
  }
}
