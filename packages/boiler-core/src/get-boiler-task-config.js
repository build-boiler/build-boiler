import path from 'path';
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
  const {environment, sources} = baseConfig;
  const {
    buildDir,
    mainBundleName,
    globalBundleName,
    scriptDir,
    rootDir
  } = sources;
  const {isDev, isServer} = environment;

  const taskObj = tasks ? tasks.reduce((acc, task) => {
    task = _.camelCase(task);

    if (task === 'webpack' && !sources.entry) {
      const entry = {
        [mainBundleName]: [`./${scriptDir}/index.js`],
        [globalBundleName]: [
          path.join(rootDir, `boiler-task-${task}`, buildDir, 'global-entry.js')
        ]
      };

      Object.assign(sources, {entry});
    }

    return {
      ...acc,
      [task]: taskConfig[task] || {}
    };
  }, {}) : {};

  const {
    //if a "project" not a "module" turn on file reving
    isomorphic = {},
    cb
  } = taskConfig;

  const enableIsomorphic = _.isPlainObject(isomorphic) && Object.keys(isomorphic).length > 0;

  if (enableIsomorphic && !isomorphic.entries) {
    Object.assign(isomorphic, {
      componentEntries: [
        '**/{,*-}entry.{js,jsx}'
      ]
    });
  }

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

  const {
    webpack = {},
    ...restTaskConfig
  } = taskObj;

  //HACK: to preserver legacy `gulp/config/index` behavior but move properties
  //into the task where they belong
  const shouldRev = webpack.shouldRev || taskConfig.shouldRev;
  const includePaths = webpack.includePaths || taskConfig.includePaths || [];
  const {timestamp} = webpack;
  const currTime = new Date().getTime();

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

    webpackPaths
  };

  const addTimeStamp = (fp) => {
    if (!timestamp && !/\.css$/.test(fp)) return fp;

    return fp.replace(/^(.*)\.(js|css)$/, (all, name, ext) => {
      return `${name}-${currTime}.${ext}`;
    });
  };

  const paths = Object.keys(webpackPaths).reduce((acc, key) => {
    const [devPath, prodPath] = webpackPaths[key];
    const revProd = !isDev && shouldRev;

    if (key === 'fileLoader') {
      Object.assign(acc, {
        [key]: devPath
      });
    } else {
      const fp = revProd && !isServer ? addTimeStamp(prodPath) : devPath;

      Object.assign(acc, {
        [key]: fp
      });
    }

    return acc;
  }, {});

  _.merge(webpackConfig, webpack, {
    timestamp: timestamp && currTime,
    includePaths,
    paths
  });

  const combinedConfig = _.merge({}, baseConfig, {
    environment: {
      enableIsomorphic
    },
    isomorphic,
    webpackConfig,
    ...restTaskConfig
  });

  const finalConfig = _.isFunction(cb) ? cb(combinedConfig) : combinedConfig;

  if (_.isUndefined(finalConfig)) {
    log(`[gulp-config]: Config values are undefined, ${magenta('did you forget to return an object from the cb?')}`);
  }

  return finalConfig || combinedConfig;
}
