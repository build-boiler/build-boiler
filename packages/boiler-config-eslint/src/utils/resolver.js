import path from 'path';

/**
 * Resolve from dir path
 * @param {String} dir the root dir to resolve from
 * @return {Function}
 */
export default function(dir) {
  return (fp) => {
    return path.resolve(dir, fp);
  };
}
