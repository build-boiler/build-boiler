import isString from 'lodash/isString';
import isPlainObject from 'lodash/isPlainObject';
import isFunction from 'lodash/isFunction';
import assemble from 'assemble-core';
import {safeLoad} from 'js-yaml';
import {readFileSync} from 'fs';
import Plasma from 'plasma';
import boilerUtils from 'boiler-utils';
import getTemplateFns from './utils/template-fns';

/**
 * Setup the Assemble `app` and add data/utility functions
 * @param {Object} config from `boiler-config-base` and potentially `boiler-core`
 * @param {Object} opts options
 * @param {String|Object} opts.data glob to yml/json data or an object of data
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
  const {addbase} = utils;
  const {renameKey} = boilerUtils;
  let parentData = {};

  plasma.dataLoader('yml', function(fp) {
    const str = readFileSync(fp, 'utf8');
    return safeLoad(str);
  });

  const templateFns = getTemplateFns(config, data);

  const defaultData = {
    sources,
    environment,
    webpackConfig,
    ...templateFns
  };

  const makeDataPath = (fp) => {
    const cwd = process.cwd();

    return fp.indexOf(cwd) === -1 ? addbase(fp) : fp;
  };

  if (isString(data)) {
    const dataPath = makeDataPath(data);

    parentData =  plasma.load(dataPath, {namespace: true});
  } else if (Array.isArray(data)) {
    const [fp, opts] = data;
    const dataPath = makeDataPath(fp);

    parentData =  plasma.load(dataPath, opts);
  } else if (isPlainObject(data)) {
    parentData = data;
  } else if (isFunction(data)) {
    parentData = data(config, defaultData) || {};
  }

  app.data({
    ...defaultData,
    ...parentData
  });

  app.option('renameKey', opts.renamKey || renameKey);

  return app;
}
