/**
 * Script to generate a .eslintrc file for use in editors or wherever outside of
 * your application.
 */
import path from 'path';
import fs from 'fs';
import assign from 'object-assign';
import {path as appPath} from 'app-root-path';

import config from './eslint-config';
import makeBaseRules from './base-rules';
import makeReactRules from './react-rules';
import log, {blue} from './logger';

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

const rcPath = path.join(appPath, '/.eslintrc');

function cbToProm(fn) {
  return (arg) => {
    return new Promise((res, rej) => {
      fn.call(fn, arg, (err, data) => {
        if (err) return rej(err);

        res(data);
      });
    });
  };
}

export default async function(opts) {
  let exists = false;

  try {
    const stats = await cbToProm(fs.stat)(rcPath);

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

    return await (fs.writeFile)(
      rcPath,
      JSON.stringify(
        assign(config, {rules})
        , null
        , '\t'
      )
    );
  }
}
