import _config from './config';
import _loaders from './loaders';
import _plugins from './plugins';

export const plugins = _plugins;
export const loaders = _loaders;
export const config = _config;

//HACK: sharing the babel query between methods in order to
//pass to the `isparta` config
//let babelQuery = null;
//const methodHooks = {
  //plugins: _plugins,
  //loaders(config, data) {
    //const loaderData = _loaders(config, data);
    //babelQuery = loaderData.babelQuery;

    //return loaderData;
  //},
  //config(config, data) {
    //return _config(config, data, {query: babelQuery});
  //}
//};

//export default methodHooks;


  //const defaultExternals = {
    //'sinon': 'window.sinon'
  //};

  //const coverageConfig = {
    //isparta: {
      //embedSource: true,
      //noAutoWrap: true,
      //babel: babelQuery
    //}
  //};

    //test() {
      //const testConfig = {
        //module: {
          //preLoaders,
          //loaders,
          //postLoaders
        //},
        //plugins,
        //watch: true,
        //devtool: 'inline-source-map'
      //};

      //return _.merge({}, defaultConfig, testConfig, coverageConfig);
    //},

    //ci() {
      //const uglifyLoader = {
        //test: /\.jsx?$/,
        //loader: 'uglify',
        //exclude: /\-spec\.js$/
      //};
      //const ciConfig = {
        //module: {
          //preLoaders,
          //loaders,
          //postLoaders: [uglifyLoader, ...postLoaders]
        //},
        //plugins,
        //// allow getting rid of the UglifyJsPlugin
        //// https://github.com/webpack/webpack/issues/1079
        //'uglify-loader': {
          //compress: {warnings: false}
        //}
      //};

      //return _.merge({}, defaultConfig, ciConfig, coverageConfig);
    //}
