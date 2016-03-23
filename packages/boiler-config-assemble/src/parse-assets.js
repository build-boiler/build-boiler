import path from 'path';
import merge from 'lodash/merge';
import fsX, {readJsonSync} from 'fs-extra';
import async from 'async';
import makeTools from 'boiler-addon-isomorphic-tools';

export default function(config, opts = {}) {
  const {environment, sources, utils} = config;
  const {
    buildDir,
    globalStatsFile,
    statsFile
  } = sources;
  const {isDev} = environment;
  const {addbase} = utils;
  const {isomorphic} = opts;
  const statsDir = addbase(buildDir);
  const globalStatsPath = path.join(statsDir, globalStatsFile);
  const tools = makeTools(Object.assign({}, config, {
    isPlugin: false,
    isMainTask: true
  }));
  let prom;

  function makeStats(main, global) {
    const {assets: images, ...rest} = global;

    return merge({}, main, rest, {images});
  }

  if (isomorphic) {
    prom = tools.development(isDev).server(statsDir).then(() => {
      return Promise.resolve(
        makeStats(tools.assets(), readJsonSync(globalStatsPath))
      );
    });
  } else {
    prom = new Promise((res, rej) => {
      const statsPaths = [
        path.join(statsDir, statsFile),
        globalStatsPath
      ];

      async.map(statsPaths, fsX.readJson, (err, results) => {
        if (err) return res({});
        const [main, global] = results;

        res(
          makeStats(main, global)
        );
      });
    });
  }

  return prom;
}
