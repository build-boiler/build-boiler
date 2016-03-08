import path from 'path';
import {endsWith, isString} from 'lodash';

/**
 * Rename a file path with it's dirname and filename minus extension
 * @param {String} fp filepath
 * @param {String|undefined} name new basename
 * @return {String|undefined}
 */
export default function(fp, name) {
  const {sep} = path;
  const isDir = endsWith(fp, sep);
  const testPath = isDir ? path.join(fp, 'index') : fp;
  const split = path.dirname(testPath).split(sep);
  const hasLen = split && split.filter(str => !!str).length;
  let renamed;

  if (hasLen) {
    const [dirname] = split.slice(-1);
    const basename = isString(name) ? name : path.basename(testPath, path.extname(testPath));

    renamed = path.join(dirname, basename);
  }

  return renamed;
}
