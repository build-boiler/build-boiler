import path from 'path';
import _ from 'lodash';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpack from 'webpack';

export default function(opts) {
  const {
    provide = {},
    isMainTask,
    environment,
    sources,
    toolsPlugin,
    utils,
    webpackConfig,
    SERVER,
    TEST
  } = opts;
  const {scriptDir} = sources;
  const {isDev, isHfa, isMaster, enableIsomorphic} = environment;
  const {
    env = {},
    multipleBundles,
    paths,
    plugins: parentPluginFn
  } = webpackConfig;
  const {logError} = utils;
  const {cssBundleName, jsBundleName} = paths;
  const define = {
    'process.env': {
      NODE_ENV: JSON.stringify(isDev && !SERVER ? 'development' : 'production'),
      ...env
    }
  };

  if (SERVER) {
    define['process.env'].SERVER = true;
  } else if (!isDev && !TEST && enableIsomorphic) {
    define['process.env'].ISOMORPHIC = true;
  }

  const hfaEnv = {
    NODE_ENV: JSON.stringify(
      isMaster ?
        'production' :
        'development'
    ),
    BASE_URL: JSON.stringify(
      isMaster ?
        '/api/' :
        'https://api.hfa.io/'
    ),
    GW_CLIENT_ID: JSON.stringify(
      isMaster ?
        '25def512a6857b7acd5c922796e923d25b631be064d1f4c217c0e438152dca6d' :
        'SO/E+x58++2RGbil19qY9AjP2aZkPLb7EBAvlQ/oauGovBCney4uPKKaqtBJrbQOvXIdMLshLu+NBq79Q1a9pA=='
    )
  };

  if (isHfa) {
    Object.assign(define['process.env'], hfaEnv);
  }

  const provideDefault = {
    'global.sinon': 'sinon',
    'window.sinon': 'sinon',
    'sinon': 'sinon'
  };
  const provideConfig = Object.assign({}, provideDefault, provide);

  const {DefinePlugin, NoErrorsPlugin, ProvidePlugin, optimize} = webpack;
  const {OccurenceOrderPlugin, OccurrenceOrderPlugin} = optimize;
  //prepare for Webpack 2
  const PluginFn = OccurenceOrderPlugin || OccurrenceOrderPlugin;
  const plugins = [
    new PluginFn(),
    new DefinePlugin(define),
    new NoErrorsPlugin(),
    new ProvidePlugin(provideConfig),
    new ExtractTextPlugin(cssBundleName, {
      allChunks: true
    })
  ];

  if (isMainTask && multipleBundles) {
    const {CommonsChunkPlugin} = webpack.optimize;
    const commons = new CommonsChunkPlugin({
      name: 'vendors',
      filename: path.join(scriptDir, jsBundleName),
      minChunks: Infinity
    });

    plugins.push(commons);
  }

  const processedPlugins = _.isFunction(parentPluginFn) ? parentPluginFn(opts, plugins) : plugins;

  if (!_.isArray(processedPlugins)) {
    logError({
      err: new Error('You forgot to return a plugins array from the custom plugins function'),
      plugin: '[webpack: plugins]'
    });
  }

  if (!TEST && !SERVER) {
    processedPlugins.push(toolsPlugin);
  }

  return {
    plugins: processedPlugins
  };
}
