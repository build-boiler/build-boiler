import _ from 'lodash';
import open from 'open';
import boilerUtils from 'boiler-utils';

export default function(gulp, plugins, config) {
  const {browserSync} = plugins;
  const {browserSync: bsParent, sources, utils, test} = config;
  const {middleware: parentMiddleware, open: parentOpenFn} = bsParent;
  const {internalHost, devPort, buildDir} = sources;
  const {addbase, logError} = utils;
  const baseOpen = `http://${internalHost}:${devPort}`;
  const {
    callAndReturn: callReturn,
    runParentFn: callParent,
    runCustomTask: runFn
  } = boilerUtils;
  let openPath = baseOpen;
  let shouldOpen = true;

  return (cb) => {
    if (_.isFunction(parentOpenFn)) {
      openPath = callReturn(config)(parentOpenFn, baseOpen);
    } else if (_.isBoolean(parentOpenFn)) {
      shouldOpen = parentOpenFn;
    }

    const expireHeaders = (req, res, next) => {
      res.setHeader('cache-control', 'public, max-age=0');
      next();
    };

    const defaultMiddleware = [
      (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'authorization, accept');
        res.setHeader('Access-Control-Max-Age', '1728000');
        if (req.method === 'OPTIONS') {
          res.end();
        } else {
          next();
        }
      },
      expireHeaders
    ];

    const middleware = _.isFunction(parentMiddleware) ?
      parentMiddleware(config, defaultMiddleware) :
      defaultMiddleware;

    if (_.isUndefined(middleware)) {
      logError({
        err: new Error('You must `return` a middleware Function or Array'),
        plugin: '[browser-sync: middleware]'
      });
    }

    const bsConfig = {
      open: false,
      port: devPort,
      server: {
        baseDir: addbase(buildDir),
        middleware
      },
      online: false
    };

    const parentConfig = callParent(arguments, {
      data: bsConfig
    });

    const {
      data = {},
      fn
    } = parentConfig;

    if (test) {
      //disable when Selenium is running multiple instances
      Object.assign(data, {ghostMode: false});
    }

    const task = (done) => {
      browserSync(data, () => {
        if (shouldOpen) {
          open(openPath);
        }

        done();
      });
    };

    return runFn(task, fn, cb);
  };
}
