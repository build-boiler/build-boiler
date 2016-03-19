import assign from 'lodash/assign';
import isArray from 'lodash/isArray';
import makeEslintConfig from 'boiler-config-eslint';
import makeTools from 'boiler-addon-isomorphic-tools';
import makePlugins from './plugins';
import makeExternals from './make-externals';
import applyAddons from './utils/apply-addons';

export default function(config, {dirs}) {
  const {
    eslint: eslintParentConfig,
    isMainTask,
    environment,
    sources,
    utils,
    webpackConfig,
    ENV
  } = config;
  const {isDev, isServer} = environment;
  const {addbase} = utils;
  const {srcDir, entry} = sources;
  const {externals: externalConfig} = webpackConfig;
  const {main} = entry;
  const DEBUG = isDev;
  const TEST = ENV === 'test' || ENV === 'ci';
  const SERVER = ENV === 'server' || isServer;
  const extract = !isMainTask;
  const [expose] = isArray(main) ? main.map( fp => addbase(srcDir, fp) ) : [];
  const {externals, provide} = makeExternals(externalConfig, SERVER);
  const toolsPlugin = makeTools(
    assign({}, config, {isPlugin: true})
  );
  const sharedConfig = {
    dirs,
    toolsPlugin,
    DEBUG,
    TEST,
    SERVER
  };
  const loaderConfig = assign({}, config, sharedConfig, {extract, expose});
  const loaderData = {
    preLoaders: [],
    loaders: [],
    postLoaders: []
  };
  const loaderRe = /^loaders-.+$/;
  const loaders = applyAddons(loaderConfig, loaderData, {
    include: loaderRe
  });
  const pluginConfig = assign({}, config, sharedConfig, {provide});
  const plugins = makePlugins(pluginConfig);
  const defaultEslintConfig = {
    isDev,
    lintEnv: TEST ? 'test' : 'web',
    basic: true,
    react: false
  };
  const eslintConfig = makeEslintConfig(
    assign({}, defaultEslintConfig, eslintParentConfig)
  );

  const base = {
    isServer: SERVER,
    externals,
    plugins,
    ...loaders,
    ...eslintConfig
  };

  const addonConfig = {
    loaders: loaderConfig,
    plugins: pluginConfig
  };

  return Object.keys(addonConfig).reduce((acc, method) => {
    const config = addonConfig[method];

    return applyAddons(config, acc, {
      method,
      exclude: loaderRe
    });
  }, base);
}
