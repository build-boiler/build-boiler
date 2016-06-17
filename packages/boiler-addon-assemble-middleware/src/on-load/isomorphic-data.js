import isPlainObject from 'lodash/isPlainObject';
import {readJsonSync} from 'fs-extra';
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
  const {
    srcDir,
    scriptDir
  } = sources;
  const {addbase} = utils;
  const branch = app.cache.data.branch || '';

  const plasma = new Plasma();
  plasma.dataLoader('json', (fp) => readJsonSync(fp));

  return (file, next) => {
    try {
      const jsonData = plasma.load(
        addbase(srcDir, branch, scriptDir, '**/*.json'), {namespace: true}
      );

      if (isPlainObject(jsonData)) {
        Object.assign(file.data, jsonData);
      }

      next(null, file);
    } catch (err) {
      next(err);
    }
  };
}
