import path from 'path';
import merge from 'lodash/merge';
import fsX, {readJsonSync} from 'fs-extra';
import async from 'async';
import makeTools from 'boiler-addon-isomorphic-tools';
import {sync as globSync} from 'globby';

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
  const statsOutput = statsDir || buildDir;
  //account for chance that process is started inside of the compiled directory
  //that holds the stats
  const isSameDir = path.basename(statsOutput) === path.basename(process.cwd());
  const statsPath = isSameDir ? process.cwd() : addbase(statsOutput);
  const globalStatsPath = path.join(statsPath, globalStatsFile);
  const tools = makeTools(Object.assign({}, config, {
    isPlugin: false,
    isMainTask: true
  }));
  let prom;

  function makeStats(main, global) {
    const {assets: images, ...rest} = global;
    const integrityGlobs = globSync(
      path.join(statsPath, '*integrity*.json')
    );
    const integrity = integrityGlobs.reduce((acc, fp) => {
      try {
        const json = require(fp);
        Object.assign(acc, json);
      } catch (err) {
        return acc;
      }

      return acc;
    }, {});

    return merge({}, main, rest, {images, integrity});
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
