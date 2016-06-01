export default {
  env: {
    development: {
      presets: ['plus'],
      tasks: [
        'babel',
        'nodemon'
      ]
    },
    production: {
      presets: ['plus'],
      tasks: [
        'babel'
      ]
    }
  },
  addons: [
    'webpack-loaders-base',
    'webpack-loaders-optimize',
    'webpack-babel',
    'webpack-styles',
    'webpack-isomorphic',
    'webpack-karma'
  ],
  bucketBase: 'boiler-task-selenium'
};
