import path from 'path';

/**
 * Remove everything except for the filename
 * @param {String} fp
 *
 * @return {String} filename without extension
 */
export default function(fp) {
  return path.basename(
    fp,
    path.extname(fp)
  );
}
