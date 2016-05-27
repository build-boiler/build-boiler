/**
 * Normalize for leading and trailing slashes
 * @param {String} fp
 *
 * @return {String}
 */
export default function stripSlashes(fp) {
  if (fp.length <= 1) return fp;

  return fp.trim().replace(/^\/|\/$/g, '');
}
