import isString from 'lodash/isString';
import isPlainObject from 'lodash/isPlainObject';
import assemble from 'assemble-core';
import {safeLoad} from 'js-yaml';
import {readFileSync} from 'fs';
import path, {join} from 'path';
import Plasma from 'plasma';
import boilerUtils from 'boiler-utils';

/**
 * Setup the Assemble `app` and add data/utility functions
 * @param {Object} config from `boiler-config-base` and potentially `boiler-core`
 * @param {Object} opts options
 * @param {String|Object} opts.data glob to yml/json data or an object of data
 * @param {String} templatePath path to `pages`
 * @param {Function} renameKey
 *
 * @return {Object} `app` the Assemble instance
 */
export default function(config, opts = {}) {
  const app = assemble();
  const plasma = new Plasma();
  const {
    data = {}
  } = opts;
  const {
    environment,
    sources,
    utils,
    webpackConfig = {}
  } = config;
  const {
    srcDir,
    scriptDir,
    templateDir
  } = sources;
  const {addbase} = utils;
  const {renameKey} = boilerUtils;
  const templatePath = addbase(srcDir, templateDir);
  let parentData;

  function makeTemplatePath(dir) {
    return (fp) => `${join(templatePath, dir, fp)}.html`;
  }

  function makeJSPath(dir) {
    return (fp) => `${join(srcDir, scriptDir, dir, fp)}.js`;
  }

  plasma.dataLoader('yml', function(fp) {
    const str = readFileSync(fp, 'utf8');
    return safeLoad(str);
  });

  if (isString(data)) {
    const cwd = process.cwd();
    const dataPath = path.join(
      data.indexOf(cwd) === -1 ? addbase(data) : data
    );

    parentData =  plasma.load(dataPath, {namespace: true});
  } else if (isPlainObject(data)) {
    parentData = data;
  }

  app.data({
    sources,
    environment,
    webpackConfig,
    join,
    headScripts: makeJSPath('head-scripts'),
    layouts: makeTemplatePath('layouts'),
    macros: makeTemplatePath('macros'),
    partials: makeTemplatePath('partials'),
    ...parentData
  });

  app.option('renameKey', opts.renamKey || renameKey);

  return app;
}
