import _ from 'lodash';
import {isStream} from 'gulp-util';

/**
 * Utility for calling parent function
 * a) this is a gulp stream so just return it
 * b) this is an asynchronus or non-streaming task => call with `cb`
 * @param {Function} fn parent function
 * @param {Function} cb gulp cb
 *
 * @return {Stream|undefined}
 */
export default function(ogFn, fn, cb) {
  fn = fn || ogFn;

  if (!_.isFunction(cb)) return isStream(fn) ? fn : fn();

  if (cb && fn.length === 0) throw new Error('A `cb` must be passed to the custom task funtion');

  fn(cb);
}
