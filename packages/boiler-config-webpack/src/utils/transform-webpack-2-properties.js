import {LoaderOptionsPlugin} from 'webpack';

const webpackConfigWhitelist = [
  'amd',
  'bail',
  'cache',
  'context',
  'dependencies',
  'devServer',
  'devtool',
  'entry',
  'externals',
  'loader',
  'module',
  'name',
  'node',
  'output',
  'plugins',
  'profile',
  'recordsInputPath',
  'recordsOutputPath',
  'recordsPath',
  'resolve',
  'resolveLoader',
  'stats',
  'target',
  'watch',
  'watchOptions'
];
const skip = ['methods', 'debug'];

/**
 * Reduce over the loaders to transform `module.{preLoaders,loaders,postLoaders}` syntax
 * @param {Object} moduleConfig webpack config for `.module` property
 * @return {Object} match `module.rules` syntax https://github.com/TheLarkInn/angular-cli/blob/63801b48fa4ec0b48005ceed74bd0c03854b4c8e/packages/angular-cli/models/webpack-build-common.ts#L44
 */
function loaderReducer(moduleConfig) {
  return Object.keys(moduleConfig).reduce((acc, name) => {
    const loaderList = moduleConfig[name];
    let enforce;

    switch (name) {
      case 'preLoaders':
        enforce = 'pre';
        break;
      case 'postLoaders':
        enforce = 'post';
        break;
    }

    const rules = loaderList.map(loader => {
      if (enforce) {
        Object.assign(loader, {enforce});
      }

      return loader;
    });

    acc.rules = acc.rules || [];
    acc.rules.push(...rules);

    return acc;
  }, {});
}

/**
 * Utility to transform properties not accepted since `v2.1.0-beta.23`
 * @param {Object} webpackConfig config passed to the `webpack` compiler
 * @return {Object}
 */
export default function(webpackConfig) {
  const keys = Object.keys(webpackConfig);
  const len = keys.length - 1;
  const loaderOptions = [];

  return keys.reduce((acc, key, i) => {
    if (skip.includes(key)) return acc;

    const val = webpackConfig[key];

    if (!webpackConfigWhitelist.includes(key)) {
      loaderOptions.push(
        new LoaderOptionsPlugin({
          [key]: val
        })
      );
    } else if (key === 'module') {
      acc[key] = loaderReducer(val);
    } else {
      acc[key] = val;
    }

    if (i === len) {
      acc.plugins.push(...loaderOptions);
    }

    return acc;
  }, {});
}
