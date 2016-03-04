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
  let config;

  if (args.length === 1) {
    ([config] = args);
  }

  function compareVals(check, ...rest) {
    const [opts] = rest.slice(-1);
    let ret;

    if (_.isFunction(check)) {
      let fnArgs = config ? [config, ...rest] : [...rest];

      ret = check.apply(check, fnArgs);
    } else if (_.isRegExp(check)) {
      ret = check.test(opts);
    } else if (Array.isArray(check)) {
      check.forEach(tester => {
        if (ret) return;
        ret = _.isString(tester) && tester === opts;
        ret = _.isRegExp(tester) && tester.test(opts);
      });
    } else if (_.isString(check)) {
      ret = check;
    } else if (_.isPlainObject(check) && _.isPlainObject(opts)) {
      ret = _.assign(opts, check);
    }

    return _.isUndefined(ret) ? opts : ret;
  }

  return args.length === 1 ? compareVals : compareVals.apply(null, args);
}
