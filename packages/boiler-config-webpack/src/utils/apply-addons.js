import isRegExp from 'lodash/isRegExp';
import isFunction from 'lodash/isFunction';

/**
 * Utility function to run addons passing each subsequent
 * addon accumulated data
 *
 * @param {Object} config main config from webpack index.js
 * @param {Object} data wepback config or loader/plugin config
 *
 * @return {Object}
 */
export default function(config, data, opts = {}) {
  const {method, include, exclude} = opts;
  const {boilerConfig} = config;
  const {webpack: webpackAddons = {}} = boilerConfig.addons || {};
  const addonKeys = Object.keys(webpackAddons).filter(name => {
    let ret = true;

    if (isRegExp(include)) ret = include.test(name);
    if (isRegExp(exclude)) ret = !exclude.test(name);

    return ret;
  });

  return addonKeys.reduce((acc, name) => {
    const mod = webpackAddons[name];
    let fn;

    if (method) {
      fn = mod[method];
    } else {
      fn = mod;
    }

    return isFunction(fn) ? fn(config, acc) : acc;
  }, data);
}
