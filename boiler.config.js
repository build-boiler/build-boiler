export default {
  'extends': 'configs/boiler-config-hfa/src/index',
  bleep: 'bloop',
  //presets: ['base', 'plus'],
  tasks: [
    'assemble',
    'browser-sync',
    'clean',
    'copy',
    'eslint',
    'karma',
    'selenium',
    'webpack'
  ]
};
