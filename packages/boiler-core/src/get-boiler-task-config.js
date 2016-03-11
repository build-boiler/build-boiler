import _ from 'lodash';
import boilerUtils from 'boiler-utils';

/**
 * Combine the base config from `boiler-config-base` =>
 *   - cliConfig
 *   - `boiler.config.js`
 *   - sources/environment/utils/pkg/boilerConfig etc
 * with the parent config hooks from `gulp/config/index.js`
 * @param {Object} baseConfig from `boiler-config-base`
 * @param {Object} taskConfig from `gulp/config/index`
 * @param {Array} opts.tasks task from the `boiler.config.js` presets/tasks
 */
export default function(baseConfig, taskConfig, opts = {}) {
  const {buildLogger} = boilerUtils;
  const {log, magenta} = buildLogger;
  const {tasks = []} = opts;
  const {environment} = baseConfig;
  const {isDev, isServer} = environment;

  const taskObj = tasks ? tasks.reduce((acc, task) => {
    task = _.camelCase(task);

    return {
      ...acc,
      [task]: taskConfig[task] || {}
    };
  }, {}) : {};

  const {
    //if a "project" not a "module" turn on file reving
    shouldRev = false,
    includePaths = [],
    isomorphic = {},
    cb
  } = taskConfig;

  const {webpack, ...restTaskConfig} = taskObj;

  const enableIsomorphic = _.isPlainObject(isomorphic) && Object.keys(isomorphic).length > 0;

  const webpackPaths = {
    fileLoader: [
      'file-loader?name=[path][name].[ext]',
      'file-loader?name=[path][name]-[sha256:hash].[ext]'
    ],
    cssBundleName: [
      'css/[name].css',
      'css/[name]-[chunkhash].css'
    ],
    jsBundleName: [
      '[name].js',
      '[name]-[chunkhash].js'
    ]
  };

  const webpackConfig = {
    alias: {},

    hashFunction: 'sha256',

    expose: {},

    moduleRoot: [],

    multipleBundles: false,

    node: {
      fs: 'empty',
      __filename: true,
      __dirname: true
    },

    paths: Object.keys(webpackPaths).reduce((acc, key) => {
      const [devPath, prodPath] = webpackPaths[key];
      const revProd = !isDev && shouldRev;

      if (key === 'fileLoader') {
        Object.assign(acc, {[key]: devPath});
      } else {
        Object.assign(acc, {[key]: revProd && !isServer ? prodPath : devPath});
      }

      return acc;
    }, {}),

    vendors: [
      'lodash',
      'react',
      'react-dom'
    ],

    webpackPaths
  };

  if (webpack) {
    _.merge(webpackConfig, webpack);
  }

  const combinedConfig = _.merge({}, baseConfig, {
    sources: {
      includePaths
    },
    environment: {
      enableIsomorphic
    },
    webpackConfig,
    ...restTaskConfig
  });

  const finalConfig = _.isFunction(cb) ? cb(combinedConfig) : combinedConfig;

  if (_.isUndefined(finalConfig)) {
    log(`[gulp-config]: Config values are undefined, ${magenta('did you forget to return an object from the cb?')}`);
  }

  return finalConfig || combinedConfig;
}
