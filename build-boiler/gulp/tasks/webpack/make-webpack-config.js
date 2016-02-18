import fs from 'fs';
import {utils as pantSuitUtils} from '@hfa/pantsuit';
import _ from 'lodash';
import {join} from 'path';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';
import formatter from 'eslint-friendly-formatter';
import getLoaderPluginConfig from './get-loader-plugin-config';

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
    libraryName,
    globalBundleName,
    mainBundleName
  } = sources;
  const {
    alias,
    hashFunction,
    expose,
    multipleBundles,
    paths,
    vendors
  } = webpackConfig;
  const {jsBundleName} = paths;
  const {isDev} = environment;
  const apConfig = pantSuitUtils.autoprefixer(isDev);
  const {addbase, addroot} = utils;
  const externals = {
    jquery: 'jQuery'
  };

  const {
    preLoaders,
    loaders,
    postLoaders,
    plugins,
    rules,
    configFile
  } = getLoaderPluginConfig(config);

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
          //otherwise load the modules we want to expose
          //and the babel-polyfill to support async function, etc.
          taskEntry[mainBundleName].unshift(...['babel-polyfill', ...Object.keys(expose)]);
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
          autoprefixer(apConfig)
        ],
        devtool: 'source-map'
      };

      return _.merge({}, defaultConfig, devConfig);
    },

    production() {
      const makeDevConfig = this.development;
      const prodConfig = _.merge({}, makeDevConfig(true), {
        output: {
          library: libraryName,
          libraryTarget: 'umd'
        }
      });

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
    }
  };

  return configFn[ENV]();
}
