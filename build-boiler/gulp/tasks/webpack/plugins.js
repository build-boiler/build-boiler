import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpack from 'webpack';

export default function(opts) {
  const {
    provide = {},
    environment,
    toolsPlugin,
    webpackConfig
  } = opts;
  const {isDev} = environment;
  const {cssBundleName} = webpackConfig.paths;
  const define = {
    'process.env': {
      NODE_ENV: JSON.stringify(isDev ? 'development' : 'production')
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
    new ExtractTextPlugin(cssBundleName, {
      allChunks: true
    }),
    toolsPlugin
  ];

  return {plugins};
}
