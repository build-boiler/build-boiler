import _ from 'lodash';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

export default function(opts) {
  const {
    coverage,
    environment,
    sources,
    toolsPlugin,
    utils,
    quick,
    isMainTask,
    karma,
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
  const {isDev, isIE} = environment;
  const {expose, paths, hot, babel: babelParentConfig} = webpackConfig;
  const {fileLoader} = paths;
  const {addbase, addroot} = utils;
  const excludeRe = /^.+\/node_modules\/(?!@hfa\/).+\.jsx?$/;
  const testCoverage = coverage && TEST;
  const {coverageRe} = karma;
  const babelQuery = {};
  const babelBaseConfig = _.omit(babelrc, ['env']);
  const imageLoader = 'img?' + [
    'progressive=true',
    'minimize'
  ].join('&');
  const runHot = isMainTask && hot && !isIE;

  let sassLoader, cssLoader;

  let jsonLoader = ['json-loader'];

  let sassParams = [
    `outputStyle=${DEBUG || quick ? 'expanded' : 'compressed'}`
  ];

  if (Array.isArray(includePaths)) {
    includePaths.reduce((list, fp) => {
      list.push(`includePaths[]=${fp}`);
      return list;
    }, sassParams);
  } else if (_.isString(includePaths)) {
    sassParams.push(`includePaths[]=${includePaths}`);
  }

  sassParams.push('sourceMap', 'sourceMapContents=true');

  if (DEBUG || TEST) {
    const babelEnvConfig = _.cloneDeep(babelrc.env.development);
    let plugins;

    if (TEST) {
      plugins = babelEnvConfig.plugins.filter(plugin => _.isString(plugin) && plugin !== 'transform-runtime');
      _.assign(babelEnvConfig, {plugins});
    } else if (runHot) {
      plugins = babelEnvConfig.plugins.filter(plugin => plugin !== 'rewire');
      _.assign(babelEnvConfig, {plugins});
    } else {
      plugins = babelEnvConfig.plugins.filter(plugin => _.isString(plugin) && plugin !== 'rewire');
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

  const {omitPolyfill, transform} = babelParentConfig;
  const transformPolly = ['transform-runtime', {polyfill: true}];
  const baseTransform = ['transform-runtime', {polyfill: false}];
  const babelPlugins = babelQuery.plugins;

  if (_.isArray(transform)) {
    babelPlugins.unshift(transform);
  } else if (transform) {
    babelPlugins.unshift(
      omitPolyfill ? baseTransform : transformPolly
    );
  }

  const babelKeys = ['plugins', 'presets'];
  const babelRootQuery = Object.keys(babelQuery).reduce((acc, key) => {
    let val = babelQuery[key];

    //hack to get babel plugins to work from nested directory
    //https://github.com/babel/babel-loader/issues/166
    if (babelKeys.includes(key)) {
      acc[key] = val.map(name => {
        let basename;

        if (Array.isArray(name)) {
          const [pluginName, data] = name;
          const modName = `babel-plugin-${pluginName}`;
          let modPath;

          try {
            modPath = require.resolve(modName);
          } catch (err) {
            modPath = addroot('node_modules', modName);
          }

          const {transforms} = data || {};

          if (transforms) {
            const recursedData = transforms.reduce((acc, pluginData) => {
              const {transform} = pluginData;
              let pluginPath;

              try {
                pluginPath = require.resolve(transform);
              } catch (err) {
                pluginPath = addroot('node_modules', transform);
              }

              const transformData = Object.assign({}, pluginData, {transform: pluginPath});

              acc.transforms.push(transformData);

              return acc;
            }, {transforms: []});

            basename = [modPath, recursedData];
          } else {
            basename = data ? [modPath, data] : [modPath];
          }
        } else {
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
        let ex = false;

        if (testCoverage && !/\@hfa/.test(fp) && !/node_modules/.test(fp)) {
          ex = coverageRe.test(fp);
        } else {
          ex = excludeRe.test(fp) && fp.indexOf(rootDir) === -1;
        }

        return ex;
      },
      loader: 'babel',
      query: babelRootQuery
    },
    {
      test: toolsPlugin.regular_expression('images'),
      loader: isDev ? fileLoader : [fileLoader, imageLoader].join('!')
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

  const isparta = {
    test: /\.jsx?$/,
    loader: 'isparta',
    exclude: /\/(test|node_modules)\//,
    include: coverageRe
  };

  if (testCoverage) {
    preLoaders.unshift(isparta);
  }

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

  return {
    preLoaders,
    loaders,
    postLoaders,
    babelQuery: babelRootQuery
  };
}
