import _ from 'lodash';
import {log, blue} from './build-logger';

/**
 * Utility function to handle calling of addons inside
 * of tasks
 * @param {Object} addons
 * @param {Object} data arguments to be passed to `addon` function
 * @param {Object} opts parent functions from the "task"
 * @return {undefined}
 */
export default function(addons = {}, data, opts = {}) {
  Object.keys(addons).forEach(name => {
    const addon = addons[name];
    log(`Running addon ${blue(name)}`);

    if (_.isFunction(addon)) {
      addon(data, opts);
    } else if (Array.isArray(addon)) {
      const [fn, addonConfig] = addon;

      fn.apply(fn, [
        data,
        Object.assign({}, opts, {addonConfig})
      ]);
    }
  });
}
