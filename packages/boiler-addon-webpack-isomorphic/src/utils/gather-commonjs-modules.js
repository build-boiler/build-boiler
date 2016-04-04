import path from 'path';

/**
 * Create `externals for webpack
 * @param {Object} config `gulp config`
 * @return {Object} externals
 *
 * ex.
 * {
 *   react: 'commonjs react'
 * }
 */
export default function(config) {
  const {
    isomorphic = {},
    pkg = {}
  } = config;
  const {
    include = [],
    exclude = []
  } = isomorphic.modules || {};
  const {dependencies} = pkg;

  const blacklist = Array.isArray(exclude) && exclude.length ?
    exclude :
    Object.keys(dependencies);

  function addCommonJs(dirs, opts = {}) {
    const {base = ''} = opts;

    return dirs.reduce((acc, mod) => {
      const isBin = ['.bin'].indexOf(mod) !== -1;

      if (isBin) return acc;

      try {
        require.resolve(
          path.join(base, mod)
        );

        if (include.indexOf(mod) === -1) acc[mod] = `commonjs ${mod}`;
      } catch (err) {
        if (!base) {
          //TODO: update for the case that a directory name is passed in
          //means this is a private NPM directory
          Object.assign(
            acc,
            addCommonJs([mod], {base: mod})
          );
        }
      }

      return acc;
    }, {});
  }

  return addCommonJs(blacklist);
}
