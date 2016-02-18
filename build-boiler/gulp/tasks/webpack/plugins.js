import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpack from 'webpack';

export default function(opts) {
  const {
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

  const {OccurenceOrderPlugin, OccurrenceOrderPlugin} = webpack.optimize;
  //prepare for Webpack 2
  const PluginFn = OccurenceOrderPlugin || OccurrenceOrderPlugin;
  const plugins = [
    new PluginFn(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin(define),
    new ExtractTextPlugin(cssBundleName, {
      allChunks: true
    }),
    toolsPlugin
  ];

  return {plugins};
}
