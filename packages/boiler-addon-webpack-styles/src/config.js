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
    utils
  } = config;
  const {
    srcDir,
    scriptDir,
    globalBundleName
  } = sources;
  const {addbase} = utils;
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
    const globalEntry = [path.join(__dirname, 'global-entry.js')];
    const parentPath = addbase(srcDir, scriptDir, 'global.js');

    const exists = tryExists(parentPath, {omitReq: true});

    if (exists) {
      globalEntry.push(parentPath);
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

  assign(data, styleConfig);

  return data;
}
