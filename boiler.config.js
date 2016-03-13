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
    ['assemble-nunjucks', {isomorphic: true}]
    //'configs/addons/assemble-sample'
  ]
};
