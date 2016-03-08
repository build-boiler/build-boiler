import _ from 'lodash';
import {join} from 'path';
import gutil, {PluginError} from 'gulp-util';
import {readJsonSync} from 'fs-extra';

export default function(config, rootDir, parentConfig = {}) {
  const {ENV, browser, entry} = config;
  const {log, colors} = gutil;
  const {magenta, blue} = colors;

  const hfaDefaults = {
    shouldRev: true,
    devAssets: '//hrc-assets.hfa.io/',
    prodAssets: '//a.hrc.onl/',
    devPath: 'www.hfa.io', //ex => 'www.hfa.io'
    prodPath: 'www.hillaryclinton.com', //ex => 'www.hillaryclinton.com'
    internalHost: 'local.hfa.io'
  };

  if (parentConfig.isHfa) {
    Object.keys(hfaDefaults).forEach(key => {
      const parentVal = parentConfig[key];
      const hfaVal = hfaDefaults[key];

      if (!parentVal) {
        parentConfig[key] = hfaVal;
      }
    });
  }

  const {
    isHfa = false,
    //if a "project" not a "module" turn on file reving
    shouldRev = false,
    bucketBase = '',
    devAssets = '/',
    prodAssets = '/',
    devPath = '', //ex => 'www.hfa.io'
    prodPath = '', //ex => 'www.hillaryclinton.com'
    internalHost = 'localhost',
    includePaths = [],
    isomorphic = {},
    assemble = {},
    browserSync = {},
    eslint = {},
    karma = {},
    webpack = {},
    webdriver = {},
    cb
  } = parentConfig;

  //enable Assemble to build isomorphic application
  const enableIsomorphic = _.isPlainObject(isomorphic) && Object.keys(isomorphic).length > 0;
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
    includePaths,
    globalBundleName,
    mainBundleName,
    entry: entry || defaultEntry
  };

  const trim = (fp) => fp.lastIndexOf('/') === fp.length - 1 ? fp.slice(0, -1) : fp;

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
    },
    trim
  };

  const environment = {
    asset_path: '/', // path for assets => local_dev: '', dev: hrc-assets.hfa.io/contribute, prod: a.hrc.onl/contribute
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

  const webpackPaths = {
    fileLoader: [
      'file-loader?name=[path][name].[ext]',
      'file-loader?name=[path][name]-[sha256:hash].[ext]'
    ],
    cssBundleName: [
      'css/[name].css',
      'css/[name]-[chunkhash].css'
    ],
    jsBundleName: [
      '[name].js',
      '[name]-[chunkhash].js'
    ]
  };

  const webpackConfig = {
    alias: {},

    hashFunction: 'sha256',

    expose: {},

    moduleRoot: [],

    multipleBundles: false,

    node: {
      fs: 'empty',
      __filename: true,
      __dirname: true
    },

    paths: Object.keys(webpackPaths).reduce((acc, key) => {
      const [devPath, prodPath] = webpackPaths[key];
      const revProd = !isDev && shouldRev;

      if (key === 'fileLoader') {
        Object.assign(acc, {[key]: devPath});
      } else {
        Object.assign(acc, {[key]: revProd && !isServer ? prodPath : devPath});
      }

      return acc;
    }, {}),

    vendors: [
      'lodash',
      'react',
      'react-dom'
    ],

    webpackPaths
  };

  if (webpack) {
    _.merge(webpackConfig, webpack);
  }

  const packagePath = utils.addbase('package.json');
  let pkgInfo = {};

  try {
    pkgInfo = readJsonSync(packagePath);
  } catch (err) {
    log(`${magenta('[build-boiler]')}: No package.json at ${blue(packagePath)}`);
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

  const baseConfig = {
    ...config,
    bsConfig,
    environment,
    pkg,
    sources,
    utils,
    isomorphic,
    assemble,
    browserSync,
    eslint,
    karma,
    webdriver,
    webpackConfig
  };

  const finalConfig = _.isFunction(cb) ? cb(baseConfig) : baseConfig;

  if (_.isUndefined(finalConfig)) {
    log(`[gulp-config]: Config values are undefined, ${magenta('did you forget to return an object from the cb?')}`);
  }

  return finalConfig || baseConfig;
}
