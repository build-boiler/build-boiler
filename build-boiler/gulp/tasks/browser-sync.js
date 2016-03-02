import _ from 'lodash';
import open from 'open';
import callParent from '../utils/run-parent-fn';
import runFn from '../utils/run-custom-task';

export default function(gulp, plugins, config) {
  const {browserSync} = plugins;
  const {browserSync: bsParent, sources, utils} = config;
  const {middleware: parentMiddleware} = bsParent;
  const {internalHost, devPort, buildDir} = sources;
  const {addbase, logError} = utils;
  const openPath = `http://${internalHost}:${devPort}`;
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

  return (cb) => {
    const bsConfig = {
      open: false,
      port: devPort,
      server: {
        baseDir: addbase(buildDir),
        middleware
      }
    };

    const parentConfig = callParent(arguments, {data: bsConfig});

    const {
      data,
      fn
    } = parentConfig;

    const task = (done) => {
      browserSync(data, () => {
        open(openPath);
        done();
      });
    };

    return runFn(task, fn, cb);
  };
}
