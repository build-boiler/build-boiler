// Libraries
import isPlainObject from 'lodash/isPlainObject';
import {safeLoad} from 'js-yaml';
import {readFileSync} from 'fs';
import Plasma from 'plasma';
import merge from 'lodash/merge';


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

  const plasma = new Plasma();
  plasma.dataLoader('yml', function(fp) {
    const ymlStr = readFileSync(fp, 'utf8');

    return safeLoad(ymlStr);
  });

  return (file, next) => {
    try {
      const globalData = plasma.load(
        addbase(srcDir, branch, 'config', glob),
        {namespace: () => 'global_data'}
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
