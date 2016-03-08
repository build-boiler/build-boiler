/**
 * Create an object with hashed/unhashed file paths references
 * @param {Object} payload
 * @param {Boolean} payload.isDev
 * @param {Boolean} payload.shouldRev
 * @param {Object} payload.paths
 * @return {Object}
 */
export default function({isDev, shouldRev, paths}) {
  const keys = Object.keys(paths);

  return keys.reduce((o, key) => {
    const [first, last] = paths[key];

    o[key] = !isDev && shouldRev ? last : first;
    return o;
  }, {});
}
