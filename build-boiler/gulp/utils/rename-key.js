import path from 'path';

/**
 * Rename a file path with it's dirname and filename minus extension
 * @param {String} fp filepath
 * @return {String}
 */
export default function(fp) {
  const [dirname] = path.dirname(fp).split(path.sep).slice(-1);
  const basename = path.basename(fp, path.extname(fp));

  return path.join(dirname, basename);
}
