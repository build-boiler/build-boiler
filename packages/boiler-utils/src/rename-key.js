import path from 'path';
import isPlainObject from 'lodash/isPlainObject';
import endsWith from 'lodash/endsWith';
import isString from 'lodash/isString';

/**
 * Rename a file path with it's dirname and filename minus extension
 * @param {String} fp filepath
 * @param {String|undefined} name new basename
 * @param {String|undefined} name new basename
 * @return {String|undefined}
 */
export default function(fp, name, opts = {}) {
  if (isPlainObject(name)) {
    opts = name;
    name = null;
  }
  const {sep} = path;
  const isDir = endsWith(fp, sep);
  const testPath = isDir ? path.join(fp, 'index') : fp;
  const dir = path.dirname(testPath).replace(process.cwd(), '');
  const split = dir.split(sep);
  const len = split && split.filter(str => !!str).length;
  const {base, ext} = opts;
  let renamed;

  if (len) {
    const dirname = base ? dir : split.slice(-1)[0];
    const basename = isString(name) ? name : path.basename(testPath, ext ? '' : path.extname(testPath));

    renamed = path.join(dirname, basename);
  }

  return renamed;
}
