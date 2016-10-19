import path from 'path';
import merge from 'lodash/merge';
import {readJson} from 'fs-extra';
import async from 'async';
import makeTools from 'boiler-addon-isomorphic-tools';
import {sync as globSync} from 'globby';

export default function(config, opts = {}) {
  const {sources, utils} = config;
  const {
    buildDir,
    statsDir,
    globalStatsFile,
    statsFile
  } = sources;
  const {addbase} = utils;
  const {isomorphic} = opts;
  //Allow passing a custom `statsDir` from `sources`, useful for stuff
  //like lambda/server where stats might be copied somewhere other than `dist`
  const statsOutput = statsDir || buildDir;
  //account for chance that process is started inside of the compiled directory
  //that holds the stats
  const isSameDir = path.basename(statsOutput) === path.basename(process.cwd());
  const statsPath = isSameDir ? process.cwd() : addbase(statsOutput);
  const mainStatsPath = path.join(statsPath, statsFile);
  const globalStatsPath = path.join(statsPath, globalStatsFile);
  const integrityGlobs = globSync(
    path.join(statsPath, '*integrity*.json')
  ) || [];
  const statsPaths = [
    globalStatsPath,
    ...integrityGlobs
  ];
  let prom;

  function readStats(fps, tools) {
    return new Promise((res, rej) => {
      async.map(fps, readJson, (err, results) => {
        if (err) return res({});

        let main, global, integrityData;

        if (tools) {
          main = tools.assets();
          ([global, ...integrityData] = results);
        } else {
          ([main, global, ...integrityData] = results);
        }

        const {assets: images, ...rest} = global;
        const integrity = integrityData.reduce((acc, json) => ({
          ...acc,
          ...json
        }), {});
        const assets = merge({}, main, rest, {images, integrity});

        res(assets);
      });
    });
  }

  if (isomorphic) {
    const tools = makeTools(Object.assign({}, config, {
      isPlugin: false,
      isMainTask: true
    }));

    prom = tools.server(statsPath).then(() => {
      return Promise.resolve(
        readStats(statsPaths, tools)
      );
    });
  } else {
    prom = readStats([mainStatsPath, ...statsPaths]);
  }

  prom.retry = readStats;

  return prom;
}
