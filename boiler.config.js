export default {
  'extends': 'configs/boiler-config-hfa/src/index',
  presets: ['plus'],
  tasks: [
    //'assemble',
    //'browser-sync',
    //'clean',
    //'copy',
    //'eslint',
    //'karma',
    'mocha',
    //'selenium',
    //'webpack'
  ],
  addons: [
    'assemble-isomorphic-static',
    //'assemble-isomorphic-memory',
    'assemble-middleware',
    'assemble-nunjucks',
    'webpack-loaders-base',
    'webpack-loaders-optimize',
    'webpack-babel',
    'webpack-styles',
    'webpack-isomorphic',
    'webpack-karma'
    //['assemble-middleware', {
      //ignore: {onLoad: true}
    //}],
    //['assemble-nunjucks', {isomorphic: true, ignore: 'get-asset'}]
    //'configs/addons/assemble-sample'
  ]
};
