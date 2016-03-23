import assign from 'lodash/assign';
import merge from 'lodash/merge';
import isUndefined from 'lodash/isUndefined';

export default function(config, data) {
  const {TEST, file} = config;

  if (TEST) {
    const {plugins} = data;
    const define = 'DefinePlugin';
    const provide = 'ProvidePlugin';
    const tools = 'Webpack_isomorphic_tools_plugin';
    const testDefine = {
      ['process.env']: {
        TEST_FILE: file ? JSON.stringify(file) : null
      }
    };
    const provideDefault = {
      'global.sinon': 'sinon',
      'window.sinon': 'sinon',
      'sinon': 'sinon'
    };

    const modifiedPlugins = plugins.reduce((list, plugin) => {
      const {name} = plugin.constructor;
      let ret;

      /*eslint no-fallthrough:0*/
      switch (name) {
        case tools:
          //omit iso tools
          break;
        case define:
          merge(plugin.definitions, testDefine);
          ret = plugin;
          break;
        case provide:
          assign(plugin.definitions, provideDefault);
          ret = plugin;
          break;
        default:
          ret = plugin;
          break;
      }

      return isUndefined(ret) ? list : [...list, ret];
    });

    data.plugins = modifiedPlugins;
  }

  return data;
}
