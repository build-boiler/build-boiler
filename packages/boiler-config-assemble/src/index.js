import setup from './app-setup';
import getAssets from './parse-assets';
import runAddons from './utils/run-addons';

/**
 * Standalone or used in `boiler-task-assemble`
 * @param {Object} config `gulp config`
 *
 * @return {Object} data from addons, assets Promise, and Assemble instance
 */
export default function(config) {
  const {
    assemble: assembleParentConfig = {},
    boilerConfig,
    environment
  } = config;
  const {
    assemble: addons = {}
  } = boilerConfig.addons || {};
  const {
    enableIsomorphic: isomorphic
  } = environment;
  const {
    data,
    registerTags,
    middleware: parentMiddlware = {}
  } = assembleParentConfig;
  const app = setup(config, {data});
  const assets = getAssets(config, {isomorphic});
  const addonData = runAddons(addons, app, {
    config,
    fn: {
      nunjucks: registerTags,
      middleware: parentMiddlware
    },
    isomorphic
  });

  return {
    app,
    assets,
    data: addonData
  };
}
