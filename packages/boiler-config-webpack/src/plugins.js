import path from 'path';
import webpack from 'webpack';

export default function(opts) {
  const {
    provide = {},
    isMainTask,
    environment,
    sources,
    toolsPlugin,
    webpackConfig
  } = opts;
  const {scriptDir} = sources;
  const {isDev} = environment;
  const {
    env = {},
    multipleBundles,
    paths
  } = webpackConfig;
  const {jsBundleName} = paths;
  const define = {
    'process.env': {
      NODE_ENV: JSON.stringify(isDev ? 'development' : 'production'),
      ...env
    }
  };

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
