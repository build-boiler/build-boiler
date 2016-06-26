import _ from 'lodash';
import gutil, {log as _log, colors as _colors} from 'gulp-util';

const {blue: _blue, magenta: _magenta} = _colors;

export const colors = _colors;
export const blue = _blue;
export const magenta = _magenta;
export const prefix = `${magenta('[build-boiler]')}:`;

/**
 * Log some stuff with colors. By default the prefix is `[build-boiler]`
 * but external applications can pass in their own
 * @param {Any} args arguments to log
 * @return undefined it just logs ¯\_(ツ)_/¯
 */
export function log(...args) {
  const {BOILER_LOG} = process.env;
  const [last] = args.slice(-1);
  let modArgs, prepend;

  if (_.isPlainObject(last)) {
    ({prefix: prepend} = last);
    modArgs = args.slice(0, args.length - 1);
  } else {
    prepend = prefix;
    modArgs = args;
  }

  //Enable logging by setting process.env.BOILER_LOG
  if (BOILER_LOG && BOILER_LOG !== 'false' && args.length) {
    _log.apply(gutil, [prepend, ...modArgs]);
  }
}
