import fs from 'fs';
import _ from 'lodash';
import {join} from 'path';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';
import formatter from 'eslint-friendly-formatter';
import getLoaderPluginConfig from './get-loader-plugin-config';
import getExcludes from './gather-commonjs-modules';
import createMultipleEntries from './make-multiple-entries';

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
    base: baseConfig = {},
    babel: babelParentConfig = {},
    moduleRoot: parentModuleRoot = [],
    node,
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
    babelQuery,
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

  const defaultRoot = [
    addbase(srcDir, scriptDir),
    addroot('node_modules'),
    'node_modules'
  ];

  const moduleRoot = _.union(defaultRoot, parentModuleRoot);
  const loaderRoot = [
    addroot('node_modules'),
    addbase('node_modules')
  ];

  const defaultConfig = {
    alias,
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
      //fallback for Webpack 1
      modulesDirectories: loaderRoot,
      modules: loaderRoot
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
      //fallback for Webpack 1
      modulesDirectories: moduleRoot,
      modules: moduleRoot
    },
    node,
    ...baseConfig
  };

  const commons = {vendors};
  const context = addbase(srcDir);
  const coverageConfig = {
    isparta: {
      embedSource: true,
      noAutoWrap: true,
      babel: babelQuery
    }
  };

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
        let omitEntry, multiBase, glob, buildMultiBundles;

        if (_.isPlainObject(multipleBundles)) {
          ({omitEntry, base: multiBase, glob} = multipleBundles);
          buildMultiBundles = true;
        } else {
          buildMultiBundles = multipleBundles;
        }

        /*eslint no-inner-declarations:0*/
        function manageAdditions(mainBundle, method = 'unshift') {
          const {omitPolyfill} = babelParentConfig;
          const additions = Object.keys(expose);

          if (!omitPolyfill && mainBundle.indexOf('babel-polyfill') === -1) {
            additions.unshift('babel-polyfill');
          }
          //otherwise load the modules we want to expose
          //and the babel-polyfill to support async function, etc.
          mainBundle[method](...additions);

          if (hasShims) {
            mainBundle[method](shimFile);
          }
        }

        /**
         * build a vendor bundle if specified in the top level config
         */
        if (buildMultiBundles) {
          _.assign(taskEntry, commons);

          const bundle = taskEntry.vendors;

          manageAdditions(bundle, 'push');

          if (omitEntry) {
            bundle.push(...taskEntry[mainBundleName]);
            taskEntry = _.omit(taskEntry, mainBundleName);
          }

          const childEntries = createMultipleEntries(config, {
            glob,
            cwd: multiBase || context
          });

          _.assign(taskEntry, childEntries);
        } else {
          const bundle = taskEntry[mainBundleName];

          manageAdditions(bundle, 'unshift');
        }


        /**
         * Add the hot modules if not doing a prod build
         */
        if (!isProd) {
          if (!isIE && hot) {
            Object.keys(taskEntry).forEach((bundleName) => {
              taskEntry[bundleName].unshift(...hotEntry);
            });
          }

          plugins.push(...devPlugins);
        }
      } else {
        taskEntry = _.omit(entry, mainBundleName);
      }

      const devConfig = {
        context,
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
    },

    test() {
      const testConfig = {
        module: {
          preLoaders,
          loaders,
          postLoaders
        },
        plugins,
        watch: true,
        devtool: 'inline-source-map'
      };

      return _.merge({}, defaultConfig, testConfig, coverageConfig);
    },

    ci() {
      const uglifyLoader = {
        test: /\.jsx?$/,
        loader: 'uglify',
        exclude: /\-spec\.js$/
      };
      const ciConfig = {
        module: {
          preLoaders,
          loaders,
          postLoaders: [uglifyLoader, ...postLoaders]
        },
        plugins,
        // allow getting rid of the UglifyJsPlugin
        // https://github.com/webpack/webpack/issues/1079
        'uglify-loader': {
          compress: {warnings: false}
        }
      };

      return _.merge({}, defaultConfig, ciConfig, coverageConfig);
    }
  };

  return isServer ? configFn.server() : configFn[ENV]();
}
