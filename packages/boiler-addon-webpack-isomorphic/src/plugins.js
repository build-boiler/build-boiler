import merge from 'lodash/merge';
import isUndefined from 'lodash/isUndefined';

export default function(config, data) {
  const {TEST, SERVER, environment} = config;
  const {isDev, enableIsomorphic} = environment;
  const addIsoVar = !isDev && !TEST && enableIsomorphic;
  const tools = 'Webpack_isomorphic_tools_plugin';
  const define = 'DefinePlugin';
  //const provide = 'ProvidePlugin';
  const {plugins} = data;
  //http://cl.ly/1t0j0e0d2I1x
  //http://cl.ly/230x1E3Y3x0R

  if (SERVER) {
    const definitions = {
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        SERVER: true
      }
    };

    const modifiedPlugins = plugins.reduce((list, plugin) => {
      const {name} = plugin.constructor;
      let ret;

      switch (name) {
        case tools:
          //omit iso tools
          break;
        //case provide:
          //break;
        case define:
          merge(plugin.definitions, definitions);
          ret = plugin;
          break;
        default:
          ret = plugin;
          break;
      }

      return isUndefined(ret) ? list : [...list, ret];
    }, []);

    data.plugins = modifiedPlugins;
  } else if (addIsoVar) {
    plugins.forEach(plugin => {
      const {name} = plugin.constructor;

      if (name === define) {
        plugin.definitions['process.env'].ISOMORPHIC = true;
      }

      return plugin;
    });
  }

  return data;
}
