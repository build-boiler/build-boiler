import camelCase from 'lodash/camelCase';
import isBoolean from 'lodash/isBoolean';
import isFunction from 'lodash/isFunction';
import path from 'path';
import boilerUtils from 'boiler-utils';

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

  // Prepare data for middleware hooks to add more context without mutating config!
  const middlewareConfig = {config, app};

  function callFns(fn, ...rest) {
    fn.length === 1 ? fn(middlewareConfig).apply(null, rest) : fn.apply(null, rest);
  }

  const ignore = addonConfig.ignore || opts.ignore || {};

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

    fns.push(...parentFns);

    fns.forEach(fn => {
      app[method](/\.html$/, (file, next) => {
        callFns(fn, file, next);
      });
    });

  });
}
