import fs from 'fs-extra';
import badger from 'istanbul-cobertura-badger';

/**
 * Create a code coverage badge
 * @param {Object} config gulp project config
 * @return {Promise}
 */
export default function(config, cb) {
  const {utils, sources} = config;
  const {buildDir, coverageDir} = sources;
  const {addbase} = utils;
  const destinationDir = addbase(buildDir, 'img');
  const opts = {
    destinationDir,
    istanbulReportFile: addbase(coverageDir, 'cobertura.xml'),
    thresholds: {
      excellent: 90,
      good: 65
    }
  };

  return new Promise((res, rej) => {
    fs.ensureDir(destinationDir, (err) => {
      if (err) return rej(err);

      badger(opts, (err, status) => err ? rej(err) : res(status));
    });
  });
}
