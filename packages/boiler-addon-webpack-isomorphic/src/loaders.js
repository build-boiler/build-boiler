import path from 'path';
import assign from 'lodash/assign';

export default function(config, data) {
  const {SERVER} = config;

  if (SERVER) {
    const {boilerConfig, toolsPlugin} = config;
    const re = toolsPlugin.regular_expression('images').toString();
    const {babelExclude} = boilerConfig;
    const excludeRe = babelExclude || /node_modules/;
    const {babelQuery} = data;
    const {plugins: babelPlugins} = babelQuery;
    const {preLoaders, loaders, postLoaders} = data;
    const omit = ['typecheck', 'rewire'];
    const plugins = [
      path.resolve(__dirname, '..', 'node_modules', 'babel-plugin-add-module-exports'),
      ...babelPlugins.filter(plugin => !omit.includes(plugin))
    ];

    assign(babelQuery, {plugins});

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

