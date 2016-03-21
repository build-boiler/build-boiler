import merge from 'lodash/merge';
import isFunction from 'lodash/isFunction';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';
import isRegExp from 'lodash/isRegExp';
import isPlainObject from 'lodash/isPlainObject';

/**
 * Utility to check if argument is function, call it, and always
 * return what it returns, or the original options that were provided
 *
 * @param {Function} fn
 * @param {Array} opts additional args to call `fn` with
 *
 * @return {Any}
 */
export default function(...args) {
  const hasConfig = args.length === 1;

  /**
   * @param {Function} check
   * @param {String,Regexp,Array,Object} opts
   *
   * @return {Boolean,Any} boolean or original options
   */
  function compareVals(check, opts) {
    const fnArgs = [opts];
    let ret;

    if (hasConfig) {
      fnArgs.unshift(args[0]);
    }

    if (isFunction(check)) {
      ret = check.apply(check, fnArgs);
    } else if (isRegExp(check)) {
      ret = check.test(opts);
    } else if (isString(check)) {
      ret = check === opts;
    } else if (Array.isArray(check)) {
      check.forEach(tester => {
        if (ret) return;
        ret = compareVals(tester, opts);
      });
    } else if (isPlainObject(check) && isPlainObject(opts)) {
      ret = merge({}, opts, check);
    }

    return isUndefined(ret) ? opts : ret;
  }

  return hasConfig ? compareVals : compareVals.apply(null, args);
}
