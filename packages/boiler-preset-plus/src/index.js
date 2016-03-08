import base from 'boiler-preset-base';

export default [
  ...base,
  { karma: require('boiler-task-karma') },
  { selenium: require('boiler-task-selenium') }
];

