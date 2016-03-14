import path from 'path';
import _ from 'lodash';
import {sync as globSync} from 'globby';
import {readJsonSync} from 'fs-extra';
import {safeLoad} from 'js-yaml';
import {readFileSync} from 'fs';
import Plasma from 'plasma';
import boilerUtils from 'boiler-utils';

export default function(config) {
  const {sources, utils} = config;
  const {
    srcDir,
    templateDir
  } = sources;
  const {addbase} = utils;
  const {renameKey} = boilerUtils;
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
      page_data: jsonData
    };

    return addNamespaceData(fp, data);
  });

  return (file, next) => {
    try {
      const pageData = plasma.load(
        addbase(srcDir, templateDir, '**/*.{json,yml}'),
        {namespace: false}
      );

      if (_.isPlainObject(pageData)) {
        const currentPageData = pageData[file.key];

        currentPageData && _.merge(file.data, currentPageData);
      }

      next(null, file);
    } catch (err) {
      next(err);
    }
  };
}
