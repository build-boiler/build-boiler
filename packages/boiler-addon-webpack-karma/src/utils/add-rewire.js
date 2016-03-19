import assign from 'lodash/assign';
import path from 'path';
import boilerUtils from 'boiler-utils';

/**
 * Utility for adjusting the `babelQuery` to add the
 * `rewire` plugin and remove the `add-module-exports` plugin
 * @param {Object} query the `babelQuery`
 * @return {Array}
 */
export default function(query) {
  const {plugins} = query;
  const {tryExists} = boilerUtils;
  const pluginName = 'babel-plugin-rewire';
  const opts = {resolve: true, omitReq: true};
  let rewireFp = tryExists(
    path.resolve(__dirname, '..', '..', 'node_modules', pluginName),
    opts
  );
  rewireFp = rewireFp || tryExists(pluginName, opts) || pluginName;

  const addedPlugins = [rewireFp, ...plugins].filter(plugin => !/add-module-exports/.test(plugin));

  return assign({}, query, {plugins: addedPlugins});
}
