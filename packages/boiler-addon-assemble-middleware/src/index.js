import _ from 'lodash';
import path from 'path';
import boilerUtils from 'boiler-utils';
import {series} from 'async';

export default function(app, opts = {}) {
  const {
    buildLogger,
    requireDir,
    transformArray: createArray,
    ignore = {}
  } = boilerUtils;
  const {log, blue} = buildLogger;
  const {config, fn: parentConfig} = opts;
  const {middleware} = parentConfig;

  function callFns(fn, ...rest) {
    fn.length === 1 ? fn(config).apply(null, rest) : fn.apply(null, rest);
  }

  const hooks = [
    'on-load',
    'pre-render',
    'pre-compile'
  ];

  hooks.forEach(hook => {
    const method = _.camelCase(hook);
    const ignoreFns = ignore[method] || ignore;
    const fns = requireDir(path.join(__dirname, hook), {
      ignore: ignoreFns
    });
    const parentFns = createArray(
      middleware[method],
      _.isFunction
    );

    fns.push(...parentFns);

    app[method](/\.html$/, (file, next) => {
      /**
       * onLoad is sync so can't be used with `async.series`
       */
      if (method === 'onLoad') {
        const noop = () => {};

        fns.forEach(fn => callFns(fn, file, noop));
        next(null, file);
      } else {
        const seriesFns = fns.reduce((list, fn) => ([
          ...list,
          (cb) => callFns(fn, file, cb)
        ]), []);

        series(seriesFns, (err, result) => {
          if (err) log(`Error in ${blue(method)} middleware`);

          next(null, file);
        });
      }

    });
  });
}
