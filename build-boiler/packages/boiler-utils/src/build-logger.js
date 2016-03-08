import _ from 'lodash';
import gutil, {log, colors as _colors} from 'gulp-util';

const {blue: _blue, magenta: _magenta} = _colors;

export const colors = _colors;
export const blue = _blue;
export const magenta = _magenta;
export const prefix = `${magenta('[build-boiler]')}:`;

export default function(...args) {
  const [last] = args.slice(-1);
  let modArgs, prepend;

  if (_.isPlainObject(last)) {
    ({prefix: prepend} = last);
    modArgs = args.slice(0, args.length - 1);
  } else {
    prepend = prefix;
    modArgs = args;
  }

  args.length && log.apply(gutil, [prepend, ...modArgs]);

  return {
    colors,
    blue,
    magenta,
    log,
    prefix: prepend
  };
}
