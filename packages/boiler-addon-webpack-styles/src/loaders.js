import isString from 'lodash/isString';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

export default function(config, data) {
  const {DEBUG, isMainTask, quick, webpackConfig} = config;
  const {includePaths} = webpackConfig;
  const {loaders} = data;
  let sassParams = [
    `outputStyle=${DEBUG || quick ? 'expanded' : 'compressed'}`
  ];
  let sassLoader, cssLoader;

  if (Array.isArray(includePaths)) {
    includePaths.reduce((list, fp) => {
      list.push(`includePaths[]=${fp}`);
      return list;
    }, sassParams);
  } else if (isString(includePaths)) {
    sassParams.push(`includePaths[]=${includePaths}`);
  }

  sassParams.push('sourceMap', 'sourceMapContents=true');

  if (DEBUG) {
    if (isMainTask) {
      sassLoader = [
        'style-loader',
        'css-loader?sourceMap&importLoaders=2',
        'postcss-loader',
        `sass-loader?${sassParams.join('&')}`
      ].join('!');
    } else {
      sassLoader = ExtractTextPlugin.extract('style-loader', [
        'css-loader?sourceMap&importLoaders=2',
        'postcss-loader',
        `sass-loader?${sassParams.join('&')}`
      ].join('!'));
    }

    cssLoader = [
      'style-loader',
      'css-loader?sourceMap&importLoaders=1&modules&localIdentName=[name]__[local]___[hash:base64:5]',
      'postcss-loader'
    ].join('!');
  } else {
    cssLoader = ExtractTextPlugin.extract('style-loader', [
      'css-loader?sourceMap&importLoaders=1&modules&localIdentName=[hash:base64:5]',
      'postcss-loader'
    ].join('!'));

    sassLoader = ExtractTextPlugin.extract('style-loader', [
      'css-loader?sourceMap&importLoaders=2',
      'postcss-loader',
      `sass-loader?${sassParams.join('&')}`
    ].join('!'));
  }

  loaders.push(...[
    {
      test: /\.css$/,
      loader: cssLoader
    },
    {
      test: /\.scss$/,
      loader: sassLoader
    }
  ]);

  return data;
}
