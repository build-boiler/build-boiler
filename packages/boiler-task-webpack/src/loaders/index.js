import {join} from 'path';
import _ from 'lodash';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import boilerUtils from 'boiler-utils';
import {name as moduleName} from '../../package';

export default function(opts) {
  const {
    boilerConfig = {},
    coverage,
    environment,
    sources,
    toolsPlugin,
    utils,
    quick,
    isMainTask,
    karma = {},
    webpackConfig,
    DEBUG,
    SERVER,
    TEST
  } = opts;
  const {
    callAndReturn: initParentFn
  } = boilerUtils;
  const {
    babelrc: baseBabelrc,
    includePaths,
    srcDir,
    entry,
    mainBundleName
  } = sources;
  const {
    expose,
    paths,
    hot,
    loaders: loaderParentConfig = {},
    babel: babelParentConfig = {}
  } = webpackConfig;
  const {isDev, isIE} = environment;
  const {fileLoader} = paths;
  const {addbase, addroot} = utils;
  const {babelExclude} = boilerConfig;
  const excludeRe = babelExclude || /node_modules/;
  const testCoverage = coverage && TEST;
  const {coverageRe} = karma;
  const babelQuery = {};
  const babelBaseConfig = _.omit(baseBabelrc, ['env']);
  const imageLoader = 'img?' + [
    'progressive=true',
    'minimize'
  ].join('&');
  const runHot = isMainTask && hot && !isIE;
  let sassParams = [
    `outputStyle=${DEBUG || quick ? 'expanded' : 'compressed'}`
  ];
  let sassLoader, cssLoader, staticAssetsLoader;

  if (Array.isArray(includePaths)) {
    includePaths.reduce((list, fp) => {
      list.push(`includePaths[]=${fp}`);
      return list;
    }, sassParams);
  } else if (_.isString(includePaths)) {
    sassParams.push(`includePaths[]=${includePaths}`);
  }

  sassParams.push('sourceMap', 'sourceMapContents=true');

  /**
   * Various parent config mutation functions
   */
  const {
    omitPolyfill,
    transform,
    query: parentBabelQuery,
    exclude: parentBabelExclude,
    babelrc: parentBabelrc
  } = babelParentConfig;
  const callParentFn = initParentFn(opts);

  const babelrc = callParentFn(parentBabelrc, baseBabelrc);

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
    const babelEnvConfig = babelrc.env.production;

    if (SERVER) {
      const omit = ['typecheck', 'rewire'];
      const plugins = babelEnvConfig.plugins.filter(plugin => !omit.includes(plugin)).concat('add-module-exports');

      _.assign(babelEnvConfig, {plugins});

      cssLoader = [
        join(__dirname, 'iso-tools-stats-loader'),
        'postcss-loader'
      ].join('!');
    } else {
      cssLoader = [
        'style-loader',
        'css-loader?sourceMap&importLoaders=1&modules&localIdentName=[hash:base64:5]',
        'postcss-loader'
      ].join('!');
    }

    sassLoader = ExtractTextPlugin.extract('style-loader', [
      'css-loader?sourceMap&importLoaders=2',
      'postcss-loader',
      `sass-loader?${sassParams.join('&')}`
    ].join('!'));

    _.merge(babelQuery, babelBaseConfig, babelEnvConfig);
  }

  const preLoaders = [];

  if (!TEST && !SERVER) {
    //TODO: figure out why eslint all of a sudden started throwing
    //error only with tests
    //error  Parsing error: Illegal import declaration
    preLoaders.push({
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'eslint-loader'
    });
  }

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

  const modRoot = addroot(moduleName, 'node_modules');
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
            modPath = join(modRoot, modName);
          }

          const {transforms} = data || {};

          if (transforms) {
            const recursedData = transforms.reduce((acc, pluginData) => {
              const {transform} = pluginData;
              let pluginPath;

              try {
                pluginPath = require.resolve(transform);
              } catch (err) {
                pluginPath = join(modRoot, transform);
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
            basename = join(modRoot, `babel-plugin-${name}`);
          }
        }


        return basename;
      });
    } else {
      acc[key] = val;
    }

    return acc;
  }, {});


  if (SERVER) {
    staticAssetsLoader = join(__dirname, 'iso-tools-stats-loader');
  } else if (isDev) {
    staticAssetsLoader = fileLoader;
  } else {
    staticAssetsLoader = [fileLoader, imageLoader].join('!');
  }

  const finalBabelQuery = callParentFn(parentBabelQuery, babelRootQuery);

  const loaders = [
    {
      test: /\.jsx?$/,
      exclude(fp) {
        const parentEx = callParentFn(parentBabelExclude, fp);
        let ex = false;

        if (_.isBoolean(parentEx)) {
          ex = parentEx;
        } else {
          if (testCoverage && !/\@hfa/.test(fp) && !/node_modules/.test(fp)) {
            ex = coverageRe.test(fp);
          } else {
            ex = ex = excludeRe.test(fp);
          }
        }

        return ex;
      },
      loader: 'babel',
      query: finalBabelQuery
    },
    {
      test: toolsPlugin.regular_expression('images'),
      loader: staticAssetsLoader
    },
    {
      test: /\.(ico|ttf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
      loader: fileLoader
    },
    {
      test: /\.json$/,
      loader: 'json'
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

  if (SERVER) {
    loaders.unshift({
      test: /\.jsx?$/,
      exclude: excludeRe,
      loader: join(__dirname, 'mocks-loader')
    });
  }

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
    ...callParentFn(loaderParentConfig, {preLoaders, loaders, postLoaders}),
    babelQuery: finalBabelQuery
  };
}