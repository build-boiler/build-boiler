// Libraries
import isPlainObject from 'lodash/isPlainObject';
import merge from 'lodash/merge';
import plasma from '../utils/plasma';


/**
 * @param {Object} middlewareConfig
 *   @param {Object} middlewareConfig.config
 *   @param {Object} middlewareConfig.app
 *   @param {String} middlewareConfig.glob // Optional glob for retrieving data files
 * @return {Function}
 */
export default function getGlobalDataFn(middlewareConfig) {
  // NOTE: This default glob is repeated in index.js and page-data.js (for easier testing :/)
  const {config, app, glob = '**/*.yml'} = middlewareConfig;
  const {sources, utils} = config;
  const {srcDir} = sources;
  const {addbase} = utils;
  const branch = app.cache.data.branch || '';
  const load = plasma({
    ext: 'yml',
    namespace() {
      return 'global_data';
    }
  });

  return (file, next) => {
    try {
      const globalData = load(
        addbase(srcDir, branch, 'config', glob)
      );

      if (isPlainObject(globalData)) {
        merge(file.data, globalData);
      }

      next(null, file);
    } catch (err) {
      next(err);
    }
  };
}
