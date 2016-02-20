import _ from 'lodash';
import {join} from 'path';
import gutil, {PluginError} from 'gulp-util';

export default function(config, rootDir, parentConfig = {}) {
  const {ENV, browser, entry} = config;
  const {log, colors} = gutil;
  const {magenta, blue} = colors;

  const hfaDefaults = {
    shouldRev: true,
    //if want a "vendor" bundle turn on `multipleBundles` and specify your vendors in `webpackConfig.vendors`
    multipleBundles: false,
    bucketBase: '',
    devAssets: '//hrc-assets.hfa.io/',
    prodAssets: '//a.hrc.onl/',
    devPath: 'www.hfa.io', //ex => 'www.hfa.io'
    prodPath: 'www.hillaryclinton.com', //ex => 'www.hillaryclinton.com'
    internalHost: 'local.hfa.io'
  };

  if (parentConfig.isHfa) {
    _.assign(parentConfig, hfaDefaults);
  }

  const {
    isHfa = false,
    //if a "project" not a "module" turn on file reving
    shouldRev = false,
    //if want a "vendor" bundle turn on `multipleBundles` and specify your vendors in `webpackConfig.vendors`
    multipleBundles = false,
    bucketBase = '',
    devAssets = '/',
    prodAssets = '/',
    devPath = '', //ex => 'www.hfa.io'
    prodPath = '', //ex => 'www.hillaryclinton.com'
    internalHost = 'localhost',
    webpack,
    cb
  } = parentConfig;

  //enable Assemble to build isomorphic application
  const enableIsomorphic = false;
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
          "transform-runtime",
          "transform-decorators-legacy",
          "typecheck"
        ]
      },
      "production": {
        "plugins": [
          "transform-runtime",
          "transform-decorators-legacy",
          "typecheck"
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
    includePaths: [],
    globalBundleName,
    mainBundleName,
    entry: entry || defaultEntry
  };

  const utils = {
    addbase(...args) {
      const base = [process.cwd()];
      const allArgs = [...base, ...args];
      return join(...allArgs);
    },
    addroot(...args) {
      const base = [rootDir];
      const allArgs = [...base, ...args];
      return join(...allArgs);
    },
    getTaskName(task) {
      const split = task.name.split(':');
      const len = split.length;
      let ret;

      if (len === 2) {
        ret = split.slice(-1)[0];
      } else if (len > 2) {
        ret = split.slice(1);
      }

      return ret;
    },
    logError({err, plugin}) {
      const pluginErr = new PluginError(plugin, err, {showStack: true});

      log(magenta(pluginErr.plugin));
      log(blue(pluginErr.message));
      log(pluginErr.stack);
      process.exit(1);
    }
  };

  const environment = {
    asset_path: '', // path for assets => local_dev: '', dev: hrc-assets.hfa.io/contribute, prod: a.hrc.onl/contribute
    link_path: TRAVIS_BRANCH ? 'TRAVIS_BRANCH' : '',
    image_dir: 'img',
    template_env: ENV,
    isHfa,
    isDev,
    isServer,
    isIE,
    isMaster,
    isDevRoot,
    enableIsomorphic
  };

  if (!isDev && TRAVIS_BRANCH) {
    let devAssetPath = `${devAssets}${bucketBase || ''}`;
    const prodAssetPath = `${prodAssets}${bucketBase || ''}`;
    // if branch is not `devel` or `master` add the branch name to the asset path
    if (!isDevRoot && !isMaster) {
      devAssetPath += `/${TRAVIS_BRANCH}`;
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

  const webpackPaths = {
    fileLoader: [
      'file-loader?name=[path][name].[ext]',
      'file-loader?name=[path][sha256:hash]-[name].[ext]'
    ],
    cssBundleName: [
      'css/[name].css',
      'css/[chunkhash]-[name].css'
    ],
    jsBundleName: [
      '[name].js',
      '[chunkhash]-[name].js'
    ]
  };

  const webpackConfig = {
    alias: {},

    hashFunction: 'sha256',

    expose: {
      'js-cookie': 'Cookie',
      'query-string': 'qs'
    },

    multipleBundles,

    paths: Object.keys(webpackPaths).reduce((acc, key) => {
      const [devPath, prodPath] = webpackPaths[key];
      const revProd = !isDev && shouldRev;

      if (isServer && key === 'fileLoader' && shouldRev) {
        Object.assign(acc, {[key]: prodPath});
      } else {
        Object.assign(acc, {[key]: revProd && !isServer ? prodPath : devPath});
      }

      return acc;
    }, {}),

    vendors: [
      'lodash',
      'react',
      'babel-polyfill'
    ]
  };

  if (webpack) {
    _.merge(webpackConfig, webpack);
  }

  const baseConfig = {
    ...config,
    bsConfig,
    environment,
    sources,
    utils,
    webpackConfig
  };

  const finalConfig = _.isFunction(cb) ? cb(baseConfig) : baseConfig;

  if (_.isUndefined(finalConfig)) {
    log(`[gulp-config]: Config values are undefined, ${magenta('did you forget to return an object from the cb?')}`);
  }

  return finalConfig || baseConfig;
}
