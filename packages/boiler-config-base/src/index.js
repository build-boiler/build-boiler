import _ from 'lodash';
import path, {join} from 'path';
import boilerUtils from 'boiler-utils';
import {readJsonSync} from 'fs-extra';
import makeCliConfig from './make-cli-config';

export default function(boilerConfigFp, opts = {}) {
  const debug = boilerUtils.debug(__filename);
  if (_.isPlainObject(boilerConfigFp)) {
    opts = boilerConfigFp;
    boilerConfigFp = null;
  }
  const {
    buildLogger,
    handleAddons,
    tryExists,
    gulpTaskUtils
  } = boilerUtils;
  const {log, blue} = buildLogger;
  const {entry} = opts;
  const rootDir = path.resolve(__dirname, '..', '..');
  const cliConfig = makeCliConfig(opts);
  const {ENV, browser} = cliConfig;
  const cwd = process.cwd();
  const {
    BROWSERSTACK_USERNAME,
    BROWSERSTACK_API,
    localIdentifier,
    TRAVIS_BRANCH,
    BOILER_ENV
  } = process.env;
  //TODO: remove all HFA specific references
  //boiler-task-webpack/src/gather-commonjs-modules.js
  //boiler-task-webpack/src/plugins.js
  //boiler-task-karma/src/karma-config.js
  let clone, boilerConfig, isHfa, ext;

  /**
   * Config from `boiler.config.js`
   */
  if (boilerConfigFp) {
    //try first the fp passed in then try at `cwd`
    boilerConfig = tryExists(boilerConfigFp, {resolve: true});
    boilerConfig = boilerConfig || tryExists(path.join(cwd, boilerConfigFp), {resolve: true});
  } else {
    boilerConfig = tryExists('boiler.config.js', {lookUp: true}) || boilerConfig;
  }

  if (_.isPlainObject(boilerConfig)) {
    debug(`Found boiler.config.js ${JSON.stringify(boilerConfig)}`);
    const {addons} = boilerConfig;
    ({extends: ext} = boilerConfig);

    //Cloning boiler config because weird issues were happening on Lambda where addons
    //were being processed and merged back onto the Object, causing some sort of circular
    //mutation where the original addons passed to `handleAddons` were an Object not an Array
    if (boilerConfig.env) {
      const boilerEnv = BOILER_ENV || TRAVIS_BRANCH ? 'production' : 'development';
      const envConfig = boilerConfig.env[boilerEnv];
      clone = _.cloneDeep({
        extends: ext,
        ...envConfig
      });
    } else {
      clone = _.cloneDeep(boilerConfig);
    }

    debug(`Found boiler.config.js with addons ${JSON.stringify(addons)}`);
    const processedAddons = handleAddons(addons, rootDir);
    clone.addons = processedAddons;
    debug(`Processed addons ${JSON.stringify(processedAddons)}`);

    log(`Found boiler config at ${blue(boilerConfigFp || 'boiler.config.js')}`);
  } else {
    const boilerDefaults = {
      devAssets: '',
      prodAssets: '',
      devPath: undefined, //ex => 'www.hfa.io'
      prodPath: undefined, //ex => 'www.hillaryclinton.com'
      internalHost: 'localhost'
    };

    clone = boilerDefaults;
  }

  if (ext) {
    let customConfig;

    /**
     * Try by filepath or module name to find some custom config
     * ex. in `boiler.config.js`
     * a) extends: 'some-node-module`
     * b) extends: '/some/relative/path/hfa'
     * c) extends: gulp/config/hfa.js
     */
    customConfig = tryExists(ext, { resolve: true });
    customConfig = customConfig || tryExists(
      ext.indexOf(process.cwd()) === -1 ? path.join(process.cwd(), ext) : ext,
      {resolve: true}
    );
    customConfig = customConfig || tryExists(
      path.join(rootDir, `boiler-config-${ext}`),
      {resolve: true}
    );

    if (customConfig) {
      isHfa = /boiler-config-hfa/.test(ext);

      customConfig && Object.keys(customConfig).forEach(key => {
        const parentVal = clone[key];
        const customVal = customConfig[key];

        if (!parentVal) {
          clone[key] = customVal;
        }
      });

      log(`Found extended config ${blue(ext)}`);
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
  } = clone;

  const devUrl = join(devPath, bucketBase);
  const prodUrl = join(prodPath, bucketBase);
  const isDev = ENV === 'development';
  const isServer = ENV === 'server';
  const isIE = browser === 'ie' || browser === 'internet explorer';
  const scriptDir = 'js';
  const devBranch = 'devel';
  const isMaster = TRAVIS_BRANCH === 'master';
  const isDevRoot = TRAVIS_BRANCH === devBranch;
  const isModule = path.basename(rootDir) === 'node_modules';

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

  const sources = {
    coverageDir: 'coverage',
    babelrc: JSON.parse(babelrc),
    devUrl,
    prodUrl,
    rootDir,
    scriptDir,
    srcDir: './src',
    templateDir: 'templates',
    mainBundleName: 'main',
    globalBundleName: 'global',
    statsFile: 'webpack-main-stats.json',
    globalStatsFile: 'webpack-global-stats.json',
    testDir: './test',
    taskDir: './gulp',
    buildDir: './dist',
    internalHost,
    devHost: 'localhost',
    devPort: 8000,
    hotPort: 8080,
    entry
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
    isHfa,
    isMaster,
    isDevRoot,
    isModule
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

  //TODO: pass ENV more intelligently
  return {
    ...cliConfig,
    boilerConfig: clone,
    bsConfig,
    environment,
    pkg,
    sources,
    utils
  };
}
