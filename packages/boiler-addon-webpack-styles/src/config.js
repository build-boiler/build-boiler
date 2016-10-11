import path from 'path';
import assign from 'lodash/assign';
import autoprefixer from 'autoprefixer';
import boilerUtils from 'boiler-utils';

export default function(config, data) {
  const {tryExists} = boilerUtils;
  const {
    isMainTask,
    taskName,
    environment,
    sources,
    utils,
    webpackConfig
  } = config;
  const {
    srcDir,
    scriptDir,
    globalBundleName
  } = sources;
  const {addbase} = utils;
  const {isDev} = environment;
  const {includePaths} = webpackConfig;

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
    ],
    sassLoader: {
      includePaths: Array.isArray(includePaths) ? includePaths : [includePaths]
    }
  };

  if (!isMainTask && taskName === globalBundleName) {
    const parentPath = addbase(srcDir, scriptDir, 'global.js');
    let globalEntry = [path.join(__dirname, 'global-entry.js')];

    const exists = tryExists(parentPath, {omitReq: true});

    if (exists) {
      //HACK: overwrite internal entry, would be better to change the addon to
      //pass a config from addon array in `boiler.config.js`
      globalEntry = [parentPath];
    }

    if (data.entry && Array.isArray(data.entry[globalBundleName])) {
      data.entry[globalBundleName].push(...globalEntry);
    } else {
      const entry = {
        [globalBundleName]: globalEntry
      };

      assign(data, {entry});
    }
  }

  return assign({}, data, styleConfig);
}
