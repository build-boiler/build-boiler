import isPlainObject from 'lodash/isPlainObject';
import plasma from '../utils/plasma';

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
  const load = plasma({
    ext: 'json',
    namespace: true
  });

  return (file, next) => {
    try {
      const jsonData = load(
        addbase(srcDir, branch, scriptDir, '**/*.json')
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
