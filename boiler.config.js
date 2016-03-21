export default {
  'extends': 'configs/boiler-config-hfa/src/index',
  presets: ['plus'],
  //tasks: [
    //'assemble',
    //'browser-sync',
    //'clean',
    //'copy',
    //'eslint',
    //'karma',
    //'selenium',
    //'webpack'
  //],
  addons: [
    'assemble-middleware',
    'assemble-nunjucks',
    'boiler-addon-webpack-loaders-base',
    'boiler-addon-webpack-loaders-optimize',
    'boiler-addon-webpack-babel',
    'boiler-addon-webpack-styles',
    'boiler-addon-webpack-isomorphic',
    'boiler-addon-webpack-karma'
    //['assemble-middleware', {
      //ignore: {onLoad: true}
    //}],
    //['assemble-nunjucks', {isomorphic: true, ignore: 'get-asset'}]
    //'configs/addons/assemble-sample'
  ]
};
