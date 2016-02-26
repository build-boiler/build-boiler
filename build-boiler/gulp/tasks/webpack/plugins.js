import _ from 'lodash';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpack from 'webpack';

export default function(opts) {
  const {
    provide = {},
    environment,
    toolsPlugin,
    utils,
    webpackConfig,
    SERVER,
    TEST
  } = opts;
  const {isDev, enableIsomorphic} = environment;
  const {env = {}, paths, plugins: parentPluginFn} = webpackConfig;
  const {logError} = utils;
  const {cssBundleName} = paths;
  const define = {
    'process.env': {
      NODE_ENV: JSON.stringify(isDev && !SERVER ? 'development' : 'production'),
      ...env
    }
  };

  if (SERVER) {
    define['process.env'].SERVER = JSON.stringify(true);
  } else if (!isDev && !TEST && enableIsomorphic) {
    define['process.env'].ISOMORPHIC = JSON.stringify(true);
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
