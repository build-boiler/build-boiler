import boilerUtils from 'boiler-utils';
import {sync as globSync} from 'globby';

/**
 * Create an object of multiple entries for webpack.config.js
 * @param {String|Array} patterns globs for globby
 * @param {Object} opts options for globby
 *
 * @return {Object}
 */
export default function(patterns, opts = {}) {
  const {buildLogger, renameKey} = boilerUtils;
  const {log, magenta} = buildLogger;
  const files = globSync(patterns, opts);

  return files.reduce((acc, fp) => {
    const name = renameKey(fp);
    log(`Adding ${magenta(name)} component for isomorphic build`);

    return {
      ...acc,
      [name]: [`./${fp}`]
    };
  }, {});
}
