import path from 'path';
import assign from 'lodash/assign';
import boilerUtils from 'boiler-utils';

export default function(config, data) {
  const {SERVER} = config;

  if (SERVER) {
    const {tryExists} = boilerUtils;
    const {boilerConfig, toolsPlugin} = config;
    const re = toolsPlugin.regular_expression('images').toString();
    const {babelExclude} = boilerConfig;
    const excludeRe = babelExclude || /node_modules/;
    const {babelQuery} = data;
    const {plugins: babelPlugins} = babelQuery;
    const {preLoaders, loaders, postLoaders} = data;
    const pluginName = 'babel-plugin-add-module-exports';
    const opts = {resolve: true, omitReq: true};
    let pluginFp = tryExists(
      path.resolve(__dirname, '..', '..', 'node_modules', pluginName),
      opts
    );
    pluginFp = pluginFp || tryExists(pluginName, opts) || pluginName;
    const plugins = [
      pluginFp,
      ...babelPlugins.filter(plugin => !/typecheck/.test(plugin) && !/rewire/.test(plugin))
    ];

    assign(babelQuery, {
      babelrc: false,
      plugins
    });

    const mockAssetLoader = path.join(__dirname, 'utils', 'iso-tools-stats-loader');

    const isoLoaders = loaders.map(data => {
      const {test, loader} = data;
      let ret = data;

      if (test.toString() === re || /css/.test(loader)) {
        data.loader = mockAssetLoader;
      } else if (/babel/.test(loader)) {
        data.query = babelQuery;
      }

      return ret;
    });

    data.loaders = isoLoaders;

    postLoaders.unshift({
      test: /\.jsx?$/,
      exclude: excludeRe,
      loader: path.join(__dirname, 'utils', 'mocks-loader')
    });

    data.preLoaders = preLoaders.filter(data => {
      const {loader} = data;

      return !/eslint/.test(loader);
    });
  }

  return data;
}

