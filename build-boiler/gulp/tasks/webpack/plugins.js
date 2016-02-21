import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpack from 'webpack';

export default function(opts) {
  const {
    file,
    TEST,
    provide = {},
    environment,
    toolsPlugin,
    webpackConfig
  } = opts;
  const {isDev} = environment;
  const {env = {}, paths} = webpackConfig;
  const {cssBundleName} = paths;
  const define = {
    'process.env': {
      NODE_ENV: JSON.stringify(isDev ? 'development' : 'production'),
      ...env
    }
  };

  if (TEST) {
    Object.assign(define['process.env'], {
      TEST_FILE: file ? JSON.stringify(file) : null
    });
  }

  const provideDefault = {
    'global.sinon': 'sinon',
    'window.sinon': 'sinon',
    'sinon': 'sinon'
  };

  const {DefinePlugin, NoErrorsPlugin, ProvidePlugin, optimize} = webpack;
  const {OccurenceOrderPlugin, OccurrenceOrderPlugin} = optimize;
  //prepare for Webpack 2
  const PluginFn = OccurenceOrderPlugin || OccurrenceOrderPlugin;
  const plugins = [
    new PluginFn(),
    new DefinePlugin(define),
    new NoErrorsPlugin(),
    new ProvidePlugin(Object.assign({}, provideDefault, provide)),
    new ExtractTextPlugin(cssBundleName, {
      allChunks: true
    })
  ];

  if (!TEST) {
    plugins.push(toolsPlugin);
  }

  return {plugins};
}
