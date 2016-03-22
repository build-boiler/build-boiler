import fs from 'fs';
import _ from 'lodash';
import makeConfig from './make-webpack-config';

export default function(config) {
  const {
    ENV,
    sources,
    utils,
    webpackConfig
  } = config;
  const {
    srcDir,
    scriptDir,
    rootDir
  } = sources;
  const {
    alias,
    base: baseConfig = {},
      moduleRoot: parentModuleRoot = [],
      node
  } = webpackConfig;
  const {addbase, addroot} = utils;

  const moduleDirs = fs
    .readdirSync(rootDir)
    .filter((dir) => /boiler-.*-webpack-?/.test(dir));

  const rootMods = moduleDirs.map((fp) => {
    return addroot(fp, 'node_modules');
  });

  const defaultRoot = [
    addbase(srcDir, scriptDir),
    'node_modules',
    ...rootMods
  ];

  const moduleRoot = _.union(defaultRoot, parentModuleRoot);
  const loaderRoot = [
    addbase('node_modules'),
    ...rootMods
  ];

  const context = addbase(srcDir);

  const defaultConfig = {
    alias,
    context,
    resolveLoader: {
      //fallback for Webpack 1
      modulesDirectories: loaderRoot,
      modules: loaderRoot
    },
    resolve: {
      extensions: [
        '',
        '.js',
        '.json',
        '.jsx',
        '.html',
        '.css',
        '.scss',
        '.yaml',
        '.yml'
      ],
      //fallback for Webpack 1
      modulesDirectories: moduleRoot,
      modules: moduleRoot
    },
    node,
    ...baseConfig
  };

  const configMethods = makeConfig(config, defaultConfig, {
    dirs: moduleDirs
  });

  return configMethods[ENV]();
}
