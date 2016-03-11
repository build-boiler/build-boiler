export default [
  { assemble: require('boiler-task-assemble') },
  { 'browser-sync': require('boiler-task-browser-sync') },
  { clean: require('boiler-task-clean') },
  { copy: require('boiler-task-copy') },
  { eslint: require('boiler-task-eslint') },
  { webpack: require('boiler-task-webpack') }
];
