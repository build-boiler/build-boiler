import path from 'path';
import webpack from 'webpack';
import boilerUtils from 'boiler-utils';
import SriStatsPlugin from 'sri-stats-webpack-plugin';
import isString from 'lodash/isString';

export default function(opts) {
  const {
    provide = {},
    isMainTask,
    isGlobalTask,
    environment,
    sources,
    utils,
    toolsPlugin,
    webpackConfig
  } = opts;
  const {callAndReturn} = boilerUtils;
  const callParentFn = callAndReturn(opts);
  const {buildDir, scriptDir} = sources;
  const {addbase} = utils;
  const {isDev} = environment;
  const {
    env = {},
    integrity,
    multipleBundles,
    paths
  } = webpackConfig;
  const {jsBundleName} = paths;
  const defaultEnv = {
    'process.env': {
      NODE_ENV: JSON.stringify(isDev ? 'development' : 'production')
    }
  };
  const define = callParentFn(env, defaultEnv);

  const {DefinePlugin, NoErrorsPlugin, ProvidePlugin, optimize} = webpack;
  const {OccurenceOrderPlugin, OccurrenceOrderPlugin} = optimize;
  //prepare for Webpack 2
  const PluginFn = OccurenceOrderPlugin || OccurrenceOrderPlugin;
  const plugins = [
    new PluginFn(),
    new DefinePlugin(define),
    new NoErrorsPlugin(),
    new ProvidePlugin(provide),
    toolsPlugin
  ];

  const runIntegrity = !!integrity && !isDev && (isMainTask || isGlobalTask);

  if (runIntegrity) {
    plugins.push(
      new SriStatsPlugin({
        algorithm: isString(integrity) ? integrity : 'sha512',
        allow: /\.(js|css)$/i,
        assetKey: 'integrity',
        saveAs: addbase(buildDir, `subresource-integrity-${isMainTask ? 'main' : 'global'}.json`),
        write: true
      })
    );
  }

  if (isMainTask && multipleBundles) {
    const {CommonsChunkPlugin} = webpack.optimize;
    const commons = new CommonsChunkPlugin({
      name: 'vendors',
      filename: path.join(scriptDir, jsBundleName),
      minChunks: Infinity
    });

    plugins.push(commons);
  }

  return plugins;
}
