import fs from 'fs';
import _ from 'lodash';
import {join} from 'path';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';
import formatter from 'eslint-friendly-formatter';
import getLoaderPluginConfig from './get-loader-plugin-config';
import getExcludes from './gather-commonjs-modules';

export default function(config) {
  const {
    ENV,
    quick,
    sources,
    isMainTask,
    utils,
    environment,
    publicPath,
    webpackConfig
  } = config;
  const {
    entry,
    srcDir,
    scriptDir,
    buildDir,
    globalBundleName,
    mainBundleName
  } = sources;
  const {
    alias,
    babel: babelParentConfig = {},
    hashFunction,
    hot,
    expose,
    multipleBundles,
    paths,
    vendors
  } = webpackConfig;
  const {jsBundleName} = paths;
  const {isDev, isIE} = environment;
  const {addbase, addroot} = utils;

  const {
    isServer,
    externals: parentExternals,
    preLoaders,
    loaders,
    postLoaders,
    plugins,
    rules,
    configFile
  } = getLoaderPluginConfig(config);

  const defaultExternals = {
    'sinon': 'window.sinon'
  };
  const externals = Object.assign({}, defaultExternals, parentExternals);

  const defaultConfig = {
    externals,
    eslint: {
      rules,
      configFile,
      formatter,
      emitError: false,
      emitWarning: false,
      failOnWarning: !isDev,
      failOnError: !isDev
    },
    resolveLoader: {
      modules: [addroot('node_modules')],
      //fallback for Webpack 1
      root: addroot('node_modules')
    },
    resolve: {
      extensions: [
        '',
        '.js',
        '.json',
        '.jsx',
        '.html',
        '.css',
        '.scss',
        '.yaml',
        '.yml'
      ],
      modules: [
        addbase(srcDir, scriptDir),
        addroot('node_modules'),
        'node_modules'
      ],
      //fallback for Webpack 1
      modulesDirectories: [
        addbase(srcDir, scriptDir),
        addroot('node_modules'),
        'node_modules'
      ],
      alias
    },
    node: {
      dns: 'mock',
      net: 'mock',
      fs: 'empty',
      __filename: true,
      __dirname: true
    }
  };

  const commons = {vendors};

  const configFn = {
    development(isProd) {
      const devPlugins = [
        new webpack.HotModuleReplacementPlugin()
      ];

      const hmrOpts = [
        `path=${publicPath}__webpack_hmr`,
        'reload=true'
      ];
      const hotEntry = [
        `webpack-hot-middleware/client?${hmrOpts.join('&')}`
      ];
      let taskEntry;

      if (isMainTask) {
        taskEntry = _.omit(entry, globalBundleName);

        /**
         * If a shims file exists compile it with the `entry` or `vendors`
         */
        const shimFile = addbase(srcDir, scriptDir, 'shims.js');
        const hasShims = fs.existsSync(shimFile);

        /**
         * build a vendor bundle if specified in the top level config
         */
        if (multipleBundles) {
          _.assign(taskEntry, commons);
          taskEntry.vendors.push(...Object.keys(expose));

          if (hasShims) {
            taskEntry.vendors.push(shimFile);
          }
        } else {
          if (hasShims) {
            taskEntry[mainBundleName].unshift(shimFile);
          }

          const {omitPolyfill} = babelParentConfig;
          const additions = Object.keys(expose);

          if (!omitPolyfill) {
            additions.unshift('babel-polyfill');
          }
          //otherwise load the modules we want to expose
          //and the babel-polyfill to support async function, etc.
          taskEntry[mainBundleName].unshift(...additions);
        }

        /**
         * Add the hot modules if not doing a prod build
         */
        if (!isProd) {
          if (!isIE && hot) {
            taskEntry[mainBundleName].unshift(...hotEntry);
          }

          plugins.push(...devPlugins);
        }

      } else {
        taskEntry = _.omit(entry, mainBundleName);
      }

      const devConfig = {
        context: addbase(srcDir),
        cache: isDev,
        debug: isDev,
        entry: taskEntry,
        output: {
          path: addbase(buildDir),
          publicPath,
          filename: join('js', jsBundleName),
          hashFunction
        },
        module: {
          preLoaders,
          loaders,
          postLoaders
        },
        plugins,
        postcss: [
          autoprefixer({
            browsers: [
              'last 2 versions',
              'Explorer >= 9',
              'Safari >= 7',
              'Opera >= 12',
              'iOS >= 5',
              'Android >= 3'
            ],
            cascade: isDev
          })
        ],
        devtool: 'source-map'
      };

      return _.merge({}, defaultConfig, devConfig);
    },

    production() {
      const makeDevConfig = this.development;
      const prodConfig = makeDevConfig(true);

      if (!quick) {
        prodConfig.plugins.push(
          new webpack.optimize.UglifyJsPlugin({
            output: {
              comments: false
            },
            compress: {
              warnings: false
            }
          }),
          new webpack.optimize.DedupePlugin()
        );
      }

      return prodConfig;
    },

    server() {
      const {isomorphic = {}} = config;
      const {context} = isomorphic;
      const {devPort, devHost} = sources;
      const {branch, asset_path: assetPath} = environment;
      const bsPath = `http://${devHost}:${devPort}/`;
      const publicPath = _.isUndefined(branch) ?  bsPath : `${assetPath}/`;
      const {modules = {}} = isomorphic;
      const {target} = modules;

      //HACK: for issue with external jquery in commonjs
      //http://stackoverflow.com/questions/22530254/webpack-and-external-libraries
      const alias = Object.keys(externals || {}).reduce((acc, key) => ({
        ...acc,
        [key]: join(__dirname, 'mocks', 'noop')
      }), {});

      const serverExternals = getExcludes(config);

      const serverConfig = {
        externals: serverExternals,
        context,
        entry,
        output: {
          path: addbase(buildDir),
          publicPath,
          filename: join('js', jsBundleName),
          libraryTarget: 'commonjs2'
        },
        module: {
          loaders
        },
        resolve: {
          alias
        },
        plugins,
        target
      };

      return _.merge(
        {},
        _.omit(defaultConfig, ['externals']),
        serverConfig
      );
    }
  };

  return isServer ? configFn.server() : configFn[ENV]();
}
