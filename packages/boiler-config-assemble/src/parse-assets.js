import path from 'path';
import merge from 'lodash/merge';
import fsX, {readJsonSync} from 'fs-extra';
import async from 'async';
import makeTools from 'boiler-addon-isomorphic-tools';

export default function(config, opts = {}) {
  const {environment, sources, utils} = config;
  const {
    buildDir,
    statsDir,
    globalStatsFile,
    statsFile
  } = sources;
  const {isDev} = environment;
  const {addbase} = utils;
  const {isomorphic} = opts;
  //Allow passing a custom `statsDir` from `sources`, useful for stuff
  //like lambda/server where stats might be copied somewhere other than `dist`
  const statsPath = addbase(statsDir || buildDir);
  const globalStatsPath = path.join(statsPath, globalStatsFile);
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
    prom = tools.development(isDev).server(statsPath).then(() => {
      return Promise.resolve(
        makeStats(tools.assets(), readJsonSync(globalStatsPath))
      );
    });
  } else {
    const readStats = () => {
      return new Promise((res, rej) => {
        const statsPaths = [
          path.join(statsPath, statsFile),
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
    };

    prom = readStats();

    //HACK: for syncing asset stats on server
    prom.retry = readStats;
  }

  return prom;
}
