import ExtractTextPlugin from 'extract-text-webpack-plugin';

export default function(config, data) {
  const {plugins} = data;
  const {
    isMainTask,
    taskName,
    sources,
    environment,
    webpackConfig
  } = config;
  const {paths} = webpackConfig;
  const {cssBundleName} = paths;
  const {globalBundleName} = sources;
  const {isDev} = environment;
  const extractCss = isMainTask && !isDev;
  const extractScss = taskName === globalBundleName;

  if (extractCss || extractScss) {
    plugins.push(
      new ExtractTextPlugin({
        filename: cssBundleName,
        allChunks: true
      })
    );
  }

  return data;
}
