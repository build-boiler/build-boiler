// Libraries
import isPlainObject from 'lodash/isPlainObject';
import merge from 'lodash/merge';
import path from 'path';
import {sync as globSync} from 'globby';
import {readJsonSync} from 'fs-extra';
import {safeLoad} from 'js-yaml';
import {readFileSync} from 'fs';
import Plasma from 'plasma';
// Packages
import boilerUtils from 'boiler-utils';


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
  const {renameKey} = boilerUtils;
  const branch = app.cache.data.branch || '';

  const plasma = new Plasma();

  /**
   * Namespace the page and mock data
   */
  function addNamespaceData(fp, data) {
    const baseDir = path.dirname(fp);
    const html = globSync(path.join(baseDir, '*.html'));

    return html.reduce((acc, htmlPath) => ({
      ...acc,
      [renameKey(htmlPath)]: data
    }), {});
  }

  plasma.dataLoader('yml', function(fp) {
    const ymlStr = readFileSync(fp, 'utf8');

    const data = {
      page_data: safeLoad(ymlStr)
    };

    return addNamespaceData(fp, data);
  });

  plasma.dataLoader('json', function(fp) {
    const jsonData = readJsonSync(fp);

    const data = {
      page_json: jsonData
    };

    return addNamespaceData(fp, data);
  });

  return (file, next) => {
    try {
      const pageData = plasma.load(
        addbase(srcDir, branch, templateDir, glob),
        {namespace: false}
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
