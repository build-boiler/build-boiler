import isString from 'lodash/isString';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

export default function(config, data) {
  const {DEBUG, environment, isMainTask, quick, webpackConfig} = config;
  const {isMaster} = environment;
  const {includePaths} = webpackConfig;
  const {loaders} = data;
  //disable SCSS/CSS sourcemaps in PROD
  //this will not disable for extract text plugin with `vendors` bundle
  //but it will make the mappings empty
  const minimize = DEBUG || quick ?
    '&-autoprefixer&-minimize' :
    '&-autoprefixer&minimize';
  const sourceMap = ( isMaster ? '' : '&sourceMap' ) + minimize;
  const sassParams = [
    'outputStyle=expanded'
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

  if (!!sourceMap) {
    sassParams.push('sourceMap', 'sourceMapContents=true');
  }

  if (DEBUG) {
    if (isMainTask) {
      sassLoader = [
        'style-loader',
        `css-loader?importLoaders=2${sourceMap}`,
        'postcss-loader',
        `sass-loader?${sassParams.join('&')}`
      ].join('!');
    } else {
      sassLoader = ExtractTextPlugin.extract({
        fallbackLoader: 'style-loader',
        loader: [
          `css-loader?importLoaders=2${sourceMap}`,
          'postcss-loader',
          `sass-loader?${sassParams.join('&')}`
        ].join('!')
      });
    }

    cssLoader = [
      'style-loader',
      `css-loader?importLoaders=1&modules&localIdentName=[name]__[local]___[hash:base64:5]${sourceMap}`,
      'postcss-loader'
    ].join('!');
  } else {
    cssLoader = ExtractTextPlugin.extract({
      fallbackLoader: 'style-loader',
      loader: [
        `css-loader?importLoaders=1&modules&localIdentName=[hash:base64:5]${sourceMap}`,
        'postcss-loader'
      ].join('!')
    });

    sassLoader = ExtractTextPlugin.extract({
      fallbackLoader: 'style-loader',
      loader: [
        `css-loader?importLoaders=2${sourceMap}`,
        'postcss-loader',
        `sass-loader?${sassParams.join('&')}`
      ].join('!')
    });
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
