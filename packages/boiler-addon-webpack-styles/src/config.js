import path from 'path';
import assign from 'lodash/assign';
import autoprefixer from 'autoprefixer';

export default function(config, data) {
  const {
    isMainTask,
    taskName,
    environment,
    sources
  } = config;
  const {
    globalBundleName
  } = sources;
  const {isDev} = environment;

  const styleConfig = {
    postcss: [
      autoprefixer({
        browsers: [
          'last 2 versions',
          'Explorer >= 9',
          'Safari >= 7',
          'Opera >= 12',
          'iOS >= 5',
          'Android >= 3'
        ],
        cascade: isDev
      })
    ]
  };

  if (!isMainTask && taskName === globalBundleName) {
    const entry = {
      [globalBundleName]: path.join(__dirname, 'global-entry.js')
    };

    assign(data, {entry});
  }

  assign(data, styleConfig);

  return data;
}
