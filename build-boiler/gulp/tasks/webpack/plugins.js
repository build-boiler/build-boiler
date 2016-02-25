import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpack from 'webpack';

export default function(opts) {
  const {
    provide = {},
    environment,
    toolsPlugin,
    webpackConfig,
    SERVER,
    TEST
  } = opts;
  const {isDev, enableIsomorphic} = environment;
  const {env = {}, paths} = webpackConfig;
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

  if (!TEST && !SERVER) {
    plugins.push(toolsPlugin);
  }

  return {plugins};
}
