import _ from 'lodash';
import boilerUtils from 'boiler-utils';

/**
 * Utility function to handle calling of addons inside
 * of tasks
 * @param {Object} addons
 * @param {Object} data arguments to be passed to `addon` function
 * @param {Object} opts parent functions from the "task"
 *
 * @return {Object}
 */
export default function(addons = {}, data, opts = {}) {
  const {buildLogger} = boilerUtils;
  const {log, blue} = buildLogger;

  return Object.keys(addons).reduce((acc, name) => {
    const addon = addons[name];
    log(`Running addon ${blue(name)}`);
    //normalize key making `isomorphic-static` => `isomorphic`
    const [key] = name.split('-');

    if (_.isFunction(addon)) {
      acc[key] = addon(data, opts);
    } else if (Array.isArray(addon)) {
      const [fn, addonConfig] = addon;

      acc[key] = fn.apply(fn, [
        data,
        Object.assign({}, opts, {addonConfig})
      ]);
    }

    return acc;
  }, {});
}
