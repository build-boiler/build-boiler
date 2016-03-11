import _ from 'lodash';

/**
 * Utility to extract a string of JS into JavaScript "runnable" code
 * @param {String} content pre-combiled string of JS code
 * @param {String|undefined} key property to pull off of `module.exports`
 *
 * @return {Funtion|Object} string converted to "runnable" JS
 */
export default function(content, key = 'default') {
  const compileTarget = _.isFunction(content.toString) ? content.toString() : content;
  const m = new module.constructor();
  m.paths = module.paths;
  m._compile(compileTarget);

  return m.exports[key] || m.exports;
}
