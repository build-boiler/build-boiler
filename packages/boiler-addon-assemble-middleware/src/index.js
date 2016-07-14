// Libraries
import camelCase from 'lodash/camelCase';
import isBoolean from 'lodash/isBoolean';
import isFunction from 'lodash/isFunction';
import isString from 'lodash/isString';
import path from 'path';
// Packages
import boilerUtils from 'boiler-utils';

export {default as plasma} from './utils/plasma';

export default function(app, opts = {}) {
  const {
    requireDir,
    transformArray: createArray
  } = boilerUtils;
  const {
    config,
    fn: parentConfig = {},
    addonConfig = {}
  } = opts;
  const {
    middleware = {}
  } = parentConfig;
  // NOTE: This default glob is repeated in pre-render/global-data.js and pre-render/page-data.js (for easier testing :/)
  const {
    all, //default all middleware to this type
    glob = '**/*.yml',
    ignore = opts.ignore || {}
  } = addonConfig;

  // Prepare data for middleware hooks to add more context without mutating config!
  const middlewareConfig = {config, app, glob};
  const hooks = [
    'on-load',
    'pre-render',
    'pre-compile'
  ];

  hooks.forEach(hook => {
    const method = camelCase(hook);
    const ignoreFns = ignore[method] || ignore;

    //return early if ignore = true
    if (isBoolean(ignoreFns) && !!ignoreFns) return;

    const fns = requireDir(path.join(__dirname, hook), {
      ignore: ignoreFns
    });
    const parentFns = createArray(
      middleware[method],
      isFunction
    );
    const register = isString(all) ? all : method;

    fns.push(...parentFns);

    fns.forEach(fn => {
      //if the function is wrapped then call it to return the middleware
      app[register](/\.html$/, fn.length === 1 ? fn(middlewareConfig) : fn);
    });
  });
}
