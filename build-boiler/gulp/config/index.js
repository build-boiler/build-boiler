import {join} from 'path';
import gutil, {PluginError} from 'gulp-util';

export default function(config, rootDir) {
  const {ENV, browser, entry} = config;
  //if a "project" not a "module" turn on file reving
  const shouldRev = false;
  //if want a "vendor" bundle turn on `multipleBundles` and specify your vendors in `webpackConfig.vendors`
  const multipleBundles = false;
  //enable Assemble to build isomorphic application
  const enableIsomorphic = true;
  const bucketBase = 'frontend-boilerplate';
  const globalBundleName = 'global';
  const devUrl = join('www.hfa.io', bucketBase);
  const prodUrl = join('www.hillaryclinton.com', bucketBase);
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
    statsFile: 'webpack-main-stats.json',
    globalStatsFile: 'webpack-global-stats.json',
    testDir: './test',
    taskDir: './gulp',
    buildDir: './dist',
    internalHost: 'local.hfa.io',
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
      gutil.log(gutil.colors.magenta(pluginErr.plugin));
      gutil.log(gutil.colors.blue(pluginErr.message));
      gutil.log(pluginErr.stack);
      process.exit(1);
    }
  };

  const environment = {
    asset_path: '', // path for assets => local_dev: '', dev: hrc-assets.hfa.io/contribute, prod: a.hrc.onl/contribute
    link_path: TRAVIS_BRANCH ? 'TRAVIS_BRANCH' : '',
    image_dir: 'img',
    template_env: ENV,
    isDev,
    isServer,
    isIE,
    isMaster,
    isDevRoot,
    enableIsomorphic
  };

  if (!isDev && TRAVIS_BRANCH) {
    let devAssetPath = `//hrc-assets.hfa.io/${bucketBase}`;
    const prodAssetPath = `//a.hrc.onl/${bucketBase}`;
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
      'nuclear-js',
      'lodash',
      'react',
      'babel-polyfill'
    ]
  };

  return {
    ...config,
    bsConfig,
    environment,
    sources,
    utils,
    webpackConfig
  };
}
