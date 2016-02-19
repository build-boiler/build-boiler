import _ from 'lodash';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

export default function(opts) {
  const {
    environment,
    sources,
    toolsPlugin,
    utils,
    quick,
    isMainTask,
    webpackConfig,
    DEBUG,
    TEST
  } = opts;
  const {
    babelrc,
    includePaths,
    rootDir,
    srcDir,
    entry,
    mainBundleName
  } = sources;
  const {isIE} = environment;
  const {expose, paths} = webpackConfig;
  const {fileLoader} = paths;
  const {addbase, addroot} = utils;
  const excludeRe = /^.+\/node_modules\/(?!@hfa\/).+\.jsx?$/;
  const babelQuery = {};
  const babelBaseConfig = _.omit(babelrc, ['env']);
  let sassLoader, cssLoader;

  let jsonLoader = ['json-loader'];

  let sassParams = [
    `outputStyle=${DEBUG || quick ? 'expanded' : 'compressed'}`
  ];

  if (includePaths && Array.isArray(includePaths)) {
    includePaths.reduce((list, fp) => {
      list.push(`includePaths[]=${fp}`);
      return list;
    }, sassParams);
  }

  sassParams.push('sourceMap', 'sourceMapContents=true');

  if (DEBUG || TEST) {
    const babelEnvConfig = _.cloneDeep(babelrc.env.development);
    let plugins;

    if (TEST) {
      plugins = babelEnvConfig.plugins.filter(plugin => _.isString(plugin) && plugin !== 'transform-runtime');
      _.assign(babelEnvConfig, {plugins});
    } else if (isIE) {
      plugins = babelEnvConfig.plugins.filter(plugin => _.isString(plugin) && plugin !== 'rewire');
      _.assign(babelEnvConfig, {plugins});
    } else {
      plugins = babelEnvConfig.plugins.filter(plugin => plugin !== 'rewire');
      _.assign(babelEnvConfig, {plugins});
    }

    _.assign(babelEnvConfig, {plugins});
    _.assign(babelQuery, babelBaseConfig, babelEnvConfig);

    sassLoader = ExtractTextPlugin.extract('style-loader', [
      'css-loader?sourceMap&importLoaders=2',
      'postcss-loader',
      `sass-loader?${sassParams.join('&')}`
    ].join('!'));

    cssLoader = [
      'style-loader',
      'css-loader?sourceMap&importLoaders=1&modules&localIdentName=[name]__[local]___[hash:base64:5]',
      'postcss-loader'
    ].join('!');
  } else {
    const babelEnvConfig = babelrc.env.production;

    cssLoader = [
      'style-loader',
      'css-loader?sourceMap&importLoaders=1&modules&localIdentName=[hash:base64:5]',
      'postcss-loader'
    ].join('!');

    sassLoader = ExtractTextPlugin.extract('style-loader', [
      'css-loader?sourceMap&importLoaders=2',
      'postcss-loader',
      `sass-loader?${sassParams.join('&')}`
    ].join('!'));

    _.merge(babelQuery, babelBaseConfig, babelEnvConfig);
  }

  const preLoaders = [
    {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'eslint-loader'
    }
  ];

  const babelKeys = ['plugins', 'presets'];
  const babelRootQuery = Object.keys(babelQuery).reduce((acc, key) => {
    let val = babelQuery[key];

    //hack to get babel plugins to work from nested directory
    //https://github.com/babel/babel-loader/issues/166
    if (babelKeys.includes(key)) {
      acc[key] = val.map(name => {
        let basename;

        switch (key) {
          case 'presets':
            basename = `babel-preset-${name}`;
            break;
          case 'plugins':
            basename = `babel-plugin-${name}`;
            break;
        }

        try {
          basename = require.resolve(basename);
        } catch (err) {
          basename = addroot('node_modules', `babel-plugin-${name}`);
        }

        return basename;
      });
    } else {
      acc[key] = val;
    }

    return acc;
  }, {});

  const loaders = [
    {
      test: /\.jsx?$/,
      exclude(fp) {
        return excludeRe.test(fp) && fp.indexOf(rootDir) === -1;
      },
      loader: 'babel',
      query: babelRootQuery
    },
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
      loaders: jsonLoader
    },
    {
      test: /\.css$/,
      loader: cssLoader
    },
    {
      test: /\.scss$/,
      loader: sassLoader
    }
  ];

  const postLoaders = [];

  if (expose && isMainTask) {
    const keys = Object.keys(expose);

    keys.forEach((modName) => {
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

  return {preLoaders, loaders, postLoaders, babelQuery};
}
