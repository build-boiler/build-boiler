export default function(config, data) {
  const {
    sources,
    toolsPlugin,
    utils,
    isMainTask,
    webpackConfig
  } = config;
  const {
    srcDir,
    entry,
    mainBundleName
  } = sources;
  const {
    expose = {},
    paths
  } = webpackConfig;
  const {fileLoader} = paths;
  const {addbase} = utils;
  const {preLoaders, loaders, postLoaders} = data;

  preLoaders.push({
    test: /\.jsx?$/,
    exclude: [/node_modules/, /global-entry/],
    loader: 'eslint-loader'
  });

  loaders.push(...[
    {
      test: toolsPlugin.regular_expression('images'),
      loader: fileLoader
    },
    {
      test: /\.(ico|ttf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
      loader: fileLoader
    },
    {
      test: /\.json$/,
      loader: 'json'
    }
  ]);

  if (expose && isMainTask) {
    Object.keys(expose).forEach((modName) => {
      const exposeName = expose[modName];
      let method = 'push';
      let testPath;

      if (modName === 'app') {
        const [bundleName] = entry[mainBundleName];
        testPath = addbase(srcDir, bundleName);
        method = 'unshift';
      } else {
        testPath = require.resolve(modName);
      }

      postLoaders[method]({
        test: testPath,
        loader: `expose?${exposeName}`
      });
    });
  }

  return {
    preLoaders,
    loaders,
    postLoaders
  };
}

