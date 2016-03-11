import gutil, {log, colors as _colors} from 'gulp-util';

const {blue: _blue, magenta: _magenta} = _colors;

export const colors = _colors;
export const blue = _blue;
export const magenta = _magenta;
export const prefix = `${magenta('[eslint-config]')}:`;

export default function(...args) {
  if (args.length) {
    log.apply(gutil, [prefix, ...args]);
  }

  return {
    colors,
    blue,
    magenta,
    log,
    prefix
  };
}

