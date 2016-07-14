// Libraries
import isPlainObject from 'lodash/isPlainObject';
import merge from 'lodash/merge';
import path from 'path';
import plasma from '../utils/plasma';


/**
 * @param {Object} middlewareConfig
 *   @param {Object} middlewareConfig.config
 *   @param {Object} middlewareConfig.app
 *   @param {String} middlewareConfig.glob // Optional glob for retrieving data files
 * @return {Function}
 */
export default function getPageDataFn(middlewareConfig) {
  // NOTE: This default glob is repeated in index.js and global-data.js (for easier testing :/)
  const {config, app, glob = '**/*.yml'} = middlewareConfig;
  const {sources, utils} = config;
  const {
    srcDir,
    templateDir
  } = sources;
  const {addbase} = utils;
  const branch = app.cache.data.branch || '';

  return (file, next) => {
    const {key, path: fp} = file;
    //TODO: this probably isn't necessary anymore ¯\_(ツ)_/¯
    const addNamespaceData = (fp, data) => {
      return {
        [key]: data
      };
    };
    const namespace = {
      key: {
        json: 'page_json',
        yml: 'page_data'
      },
      fn: addNamespaceData
    };
    const load = plasma({
      ext: ['yml', 'json'],
      namespace
    });
    const pagesDir = 'pages';
    const [suffix] = fp.split(path.join(templateDir, pagesDir) + path.sep).slice(-1);
    const dirname = path.dirname(suffix);
    const pageKey = path.join(pagesDir, dirname);
    const pageGlob = glob.replace('**', pageKey);

    try {
      const pageData = load(
        addbase(srcDir, branch, templateDir, pageGlob)
      );

      if (isPlainObject(pageData)) {
        const currentPageData = pageData[file.key];

        currentPageData && merge(file.data, currentPageData);
      }

      next(null, file);
    } catch (err) {
      next(err);
    }
  };
}
