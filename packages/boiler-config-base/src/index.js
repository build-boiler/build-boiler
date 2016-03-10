import _ from 'lodash';
import path, {join} from 'path';
import boilerUtils from 'boiler-utils';
import {readJsonSync} from 'fs-extra';
import findUp from 'findup-sync';
import makeCliConfig from './make-cli-config';

export default function(boilerConfigFp, opts = {}) {
  if (_.isPlainObject(boilerConfigFp)) {
    opts = boilerConfigFp;
    boilerConfigFp = null;
  }
  const {buildLogger, tryExists, gulpTaskUtils} = boilerUtils;
  const {log, blue} = buildLogger;
  const rootDir = findUp('packages') || findUp('node_modules');
  const cliConfig = makeCliConfig(rootDir);
  const {ENV, browser} = cliConfig;
  const {entry} = opts;
  /**
   * Config from `boiler.config.js`
   */
  const boilerConfig = tryExists(boilerConfigFp || 'boiler.config.js', {lookUp: true}) || {};
  const {extends: ext} = boilerConfig;

  if (Object.keys(boilerConfig).length) {
    log(`Found boiler config at ${blue('boiler.config.js')}`);
  } else {
    const boilerDefaults = {
      devAssets: '',
      prodAssets: '',
      devPath: undefined, //ex => 'www.hfa.io'
      prodPath: undefined, //ex => 'www.hillaryclinton.com'
      internalHost: 'localhost'
    };

    Object.assign(boilerConfig, boilerDefaults);
  }

  if (ext) {
    let customConfig;

    /**
     * Try by filepath or module name to find some custom config
     * ex. in `boiler.config.js`
     * a) extends: 'hfa'
     * b) extends: gulp/config/hfa.js
     */
    customConfig = tryExists(ext, {resolve: true});
    customConfig = customConfig || tryExists(
      path.join(rootDir, `boiler-config-${ext}`),
      {resolve: true}
    );

    if (customConfig) {
      customConfig && Object.keys(customConfig).forEach(key => {
        const parentVal = boilerConfig[key];
        const customVal = customConfig[key];

        if (!parentVal) {
          boilerConfig[key] = customVal;
        }
      });
    } else {
      throw new Error(`boiler.config.js not found at ${ext}`);
    }
  }

  const {
    //if a "project" not a "module" turn on file reving
    bucketBase = '',
    devAssets = '/',
    prodAssets = '/',
    devPath = '', //ex => 'www.hfa.io'
    prodPath = '', //ex => 'www.hillaryclinton.com'
    internalHost = 'localhost'
  } = boilerConfig;

  const globalBundleName = 'global';
  const devUrl = join(devPath, bucketBase);
  const prodUrl = join(prodPath, bucketBase);
  const mainBundleName = 'main';
  const isDev = ENV === 'development';
  const isServer = ENV === 'server';
  const isIE = browser === 'ie' || browser === 'internet explorer';
  const scriptDir = 'js';
  const {BROWSERSTACK_USERNAME, BROWSERSTACK_API, localIdentifier, TRAVIS_BRANCH} = process.env;
  const devBranch = 'devel';
  const isMaster = TRAVIS_BRANCH === 'master';
  const isDevRoot = TRAVIS_BRANCH === devBranch;
  const isModule = /\/node_modules\//.test(rootDir);

  const babelrc = `{
    "presets": ["react", "es2015", "stage-0"],
    "env": {
      "development": {
        "plugins": [
          "rewire",
          "transform-decorators-legacy",
          "typecheck",
          ["react-transform",
            {
            "transforms": [{
              "transform": "react-transform-hmr",
              "imports": ["react"],
              "locals": ["module"]
            }, {
              "transform": "react-transform-catch-errors",
              "imports": ["react", "redbox-react"]
            }]
          }]
        ]
      },
      "production": {
        "plugins": [
          "transform-decorators-legacy"
        ]
      }
    }
  }`;

  const defaultEntry = {
    [mainBundleName]: [`./${scriptDir}/index.js`],
    [globalBundleName]: [join(rootDir, `global-${isModule ? 'prod' : 'dev'}.js`)]
  };

  const sources = {
    buckets: {
      prod: '', //enter prod bucket here
      dev: '' //enter dev bucket here
    },
    coverageDir: 'coverage',
    babelrc: JSON.parse(babelrc),
    componentEntries: [
      '**/{,*-}entry.{js,jsx}'
    ],
    devUrl,
    prodUrl,
    rootDir,
    scriptDir,
    srcDir: './src',
    templateDir: 'templates',
    statsFile: 'webpack-main-stats.json',
    globalStatsFile: 'webpack-global-stats.json',
    testDir: './test',
    taskDir: './gulp',
    buildDir: './dist',
    internalHost,
    devHost: 'localhost',
    devPort: 8000,
    hotPort: 8080,
    globalBundleName,
    mainBundleName,
    entry: entry || defaultEntry
  };

  const {addbase, trim, ...restUtils} = gulpTaskUtils;

  const utils = {
    addbase: addbase(process.cwd()),
    addroot: addbase(rootDir),
    trim,
    ...restUtils
  };

  const environment = {
    asset_path: '/', // path for assets => local_dev: '', dev: hrc-assets.hfa.io/contribute, prod: a.hrc.onl/contribute
    link_path: TRAVIS_BRANCH ? 'TRAVIS_BRANCH' : '',
    image_dir: 'img',
    template_env: ENV,
    isDev,
    isServer,
    isIE,
    isMaster,
    isDevRoot
  };

  if (!isDev && TRAVIS_BRANCH) {
    const bucketPath = !!bucketBase ? bucketBase + '/' : '';
    let devAssetPath = `${trim(devAssets)}/${bucketPath}`;
    const prodAssetPath = `${trim(prodAssets)}/${bucketPath}`;
    // if branch is not `devel` or `master` add the branch name to the asset path
    if (!isDevRoot && !isMaster) {
      devAssetPath += `${TRAVIS_BRANCH}/`;
    }

    Object.assign(environment, {
      asset_path: !isMaster ? devAssetPath : prodAssetPath,
      branch: TRAVIS_BRANCH,
      link_path: isDevRoot || isMaster ? '' : `/${TRAVIS_BRANCH}` // for creating <a href={{link_path}}/something
    });
  }

  const bsConfig = {
    BROWSERSTACK_API,
    BROWSERSTACK_USERNAME,
    localIdentifier
  };

  const packagePath = utils.addbase('package.json');
  let pkgInfo = {};

  try {
    pkgInfo = readJsonSync(packagePath);
  } catch (err) {
    log(`No package.json at ${blue(packagePath)}`);
  }

  const {
    devDependencies = {},
    dependencies = {},
    main = '',
    name = '',
    version = ''
  } = pkgInfo;

  const pkg = {
    devDependencies: Object.keys(devDependencies),
    dependencies: Object.keys(dependencies),
    name,
    version,
    main
  };

  return {
    boilerConfig,
    bsConfig,
    environment,
    pkg,
    sources,
    utils
  };
}
