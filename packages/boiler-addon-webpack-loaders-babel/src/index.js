import {join} from 'path';
import assign from 'lodash/assign';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import cloneDeep from 'lodash/cloneDeep';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import isBoolean from 'lodash/isBoolean';
import boilerUtils from 'boiler-utils';
import {name as moduleName} from '../package';

export default function(config, data) {
  const {
    boilerConfig = {},
    environment,
    sources,
    utils,
    isMainTask,
    webpackConfig,
    DEBUG
  } = config;
  const {
    callAndReturn: initParentFn
  } = boilerUtils;
  const {
    babelrc: baseBabelrc
  } = sources;
  const {
    hot,
    babel: babelParentConfig = {}
  } = webpackConfig;
  const {isIE} = environment;
  const {addroot} = utils;
  const {babelExclude} = boilerConfig;
  const excludeRe = babelExclude || /node_modules/;
  const babelQuery = {};
  const babelBaseConfig = omit(baseBabelrc, ['env']);
  const runHot = isMainTask && hot && !isIE;

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
  const callParentFn = initParentFn(config);

  const babelrc = callParentFn(parentBabelrc, baseBabelrc);

  if (DEBUG) {
    const babelEnvConfig = cloneDeep(babelrc.env.development);
    let plugins;

    if (runHot) {
      plugins = babelEnvConfig.plugins.filter(plugin => plugin !== 'rewire');
      assign(babelEnvConfig, {plugins});
    } else {
      plugins = babelEnvConfig.plugins.filter(plugin => isString(plugin) && plugin !== 'rewire');
      assign(babelEnvConfig, {plugins});
    }

    assign(babelEnvConfig, {plugins});
    assign(babelQuery, babelBaseConfig, babelEnvConfig);
  } else {
    const babelEnvConfig = babelrc.env.production;

    merge(babelQuery, babelBaseConfig, babelEnvConfig);
  }

  const transformPolly = ['transform-runtime', {polyfill: true}];
  const baseTransform = ['transform-runtime', {polyfill: false}];
  const babelPlugins = babelQuery.plugins;

  if (isArray(transform)) {
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

  const finalBabelQuery = callParentFn(parentBabelQuery, babelRootQuery);
  const {loaders} = data;

  loaders.unshift({
    test: /\.jsx?$/,
    exclude(fp) {
      const parentEx = callParentFn(parentBabelExclude, fp);
      let ex = false;

      if (isBoolean(parentEx)) {
        ex = parentEx;
      } else {
        ex = excludeRe.test(fp);
      }

      return ex;
    },
    loader: 'babel',
    query: finalBabelQuery
  });

  return {
    ...data,
    babelQuery: finalBabelQuery
  };
}
