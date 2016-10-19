import fs from 'fs';
import assign from 'lodash/assign';
import merge from 'lodash/merge';
import isPlainObject from 'lodash/isPlainObject';
import omit from 'lodash/omit';
import {join} from 'path';
import webpack from 'webpack';
import WebpackMd5Hash from 'webpack-md5-hash';
import formatter from 'eslint-friendly-formatter';
import boilerUtils from 'boiler-utils';
import getLoaderPluginConfig from './get-loader-plugin-config';
import createMultipleEntries from './make-multiple-entries';
import applyAddons from './utils/apply-addons';

export default function(config, defaultConfig, opts = {}) {
  const {
    isMainTask,
    quick,
    sources,
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
    configCb = {},
    methodCb = {},
    hashFunction,
    hot,
    expose,
    multipleBundles,
    paths
  } = webpackConfig;
  const {
    callAndReturn
  } = boilerUtils;
  const callParent = callAndReturn(config);
  const {jsBundleName} = paths;
  const {isDev, isIE} = environment;
  const {addbase} = utils;

  const {
    externals,
    preLoaders,
    loaders,
    postLoaders,
    plugins,
    rules,
    configFile
  } = getLoaderPluginConfig(config, {dirs: opts.dirs});

  const {context} = defaultConfig;


  if (isMainTask) {
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

    /**
     * If a shims file exists compile it with the `entry` or `vendors`
     */
    const shimFile = addbase(srcDir, scriptDir, 'shims.js');
    const hasShims = fs.existsSync(shimFile);
    let taskEntry,
      omitEntry,
      multiBase,
      glob,
      buildMultiBundles,
      preserve;

    taskEntry = omit(entry, globalBundleName);

    if (isPlainObject(multipleBundles)) {
      ({omitEntry, base: multiBase, glob, preserve} = multipleBundles);
      buildMultiBundles = true;
    } else {
      buildMultiBundles = multipleBundles;
    }

    /*eslint no-inner-declarations:0*/
    function manageAdditions(mainBundle, method = 'unshift') {
      const additions = Object.keys(expose);

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
      const {vendors} = multipleBundles;
      const commons = {vendors};

      assign(taskEntry, commons);

      const bundle = taskEntry.vendors;

      manageAdditions(bundle, 'push');

      if (omitEntry) {
        bundle.push(...taskEntry[mainBundleName]);
        taskEntry = omit(taskEntry, mainBundleName);
      }

      const childEntries = glob ? createMultipleEntries(config, {
        glob,
        cwd: multiBase || context,
        preserve
      }) : {};

      assign(taskEntry, childEntries);
    } else {
      const bundle = taskEntry[mainBundleName];

      manageAdditions(bundle, 'unshift');
    }

    /**
     * Add the hot modules if not doing a prod build
     */
    if (isDev) {
      if (!isIE && hot) {
        Object.keys(taskEntry).forEach((bundleName) => {
          taskEntry[bundleName].unshift(...hotEntry);
        });
      }

      plugins.push(...devPlugins);
    }

    merge(defaultConfig, {
      entry: taskEntry,
      eslint: {
        rules,
        configFile,
        formatter,
        emitError: false,
        emitWarning: false,
        failOnWarning: !isDev,
        failOnError: !isDev
      }
    });
  }

  assign(defaultConfig, {
    cache: isDev,
    debug: isDev,
    externals,
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
    devtool: 'source-map'
  });

  //HACK: for adding configs
  const {
    methods = {},
    ...baseConfig
  } = applyAddons(config, defaultConfig, {method: 'config'});

  const finalConfig = callParent(configCb, baseConfig);

  const development = () => finalConfig;
  const production = () => {
    const prodConfig = development();

    if (!quick) {
      prodConfig.plugins.push(...[
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
          output: {
            comments: false
          },
          compress: {
            warnings: false
          }
        })
      ]);
    }

    prodConfig.plugins.push(
      new WebpackMd5Hash()
    );

    return prodConfig;
  };

  return callParent(methodCb, {
    development,
    production,
    ...methods
  });
}
