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
    'assemble-nunjucks'
    //['assemble-middleware', {
      //ignore: {onLoad: true}
    //}],
    //['assemble-nunjucks', {isomorphic: true, ignore: 'get-asset'}]
    //'configs/addons/assemble-sample'
  ]
};
