import _ from 'lodash';

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

    if (_.isFunction(check)) {
      ret = check.apply(check, fnArgs);
    } else if (_.isRegExp(check)) {
      ret = check.test(opts);
    } else if (_.isString(check)) {
      ret = check === opts;
    } else if (Array.isArray(check)) {
      check.forEach(tester => {
        if (ret) return;
        ret = compareVals(tester, opts);
      });
    } else if (_.isPlainObject(check) && _.isPlainObject(opts)) {
      ret = _.assign({}, opts, check);
    }

    return _.isUndefined(ret) ? opts : ret;
  }

  return hasConfig ? compareVals : compareVals.apply(null, args);
}
