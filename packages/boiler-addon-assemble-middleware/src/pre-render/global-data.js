import isPlainObject from 'lodash/isPlainObject';
import {safeLoad} from 'js-yaml';
import {readFileSync} from 'fs';
import Plasma from 'plasma';

/**
 * @param {Object} middlewareConfig
 *   @param {Object} middlewareConfig.config
 *   @param {Object} middlewareConfig.app
 * @return {Function}
 */
export default function(middlewareConfig) {
  const {config, app} = middlewareConfig;
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
        addbase(srcDir, branch, 'config', '**/*.yml'),
        {namespace: () => 'global_data'}
      );

      if (isPlainObject(globalData)) {
        Object.assign(file.data, globalData);
      }

      next(null, file);
    } catch (err) {
      next(err);
    }
  };
}
