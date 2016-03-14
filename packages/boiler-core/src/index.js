import path, {join} from 'path';
import hacker from 'require-hacker';
import boilerUtils from 'boiler-utils';
import makeConfig from 'boiler-config-base';
import getBoilerDeps from './utils/parse-config';
import getGulpPlugins from './get-gulp-plugins';
import getTaskConfig from './get-boiler-task-config';
import getTasks from './get-tasks';

export default function(gulp, opts = {}) {
  const babel = require('babel-core');
  const {
    gulpTaskname: addTaskName,
    buildLogger,
    tryExists
  } = boilerUtils;
  const {fp: configFp, include} = opts;
  const {log, blue} = buildLogger;
  const baseConfig = makeConfig(configFp);
  /**
   * Config from `boiler.config.js`
   */
  const {boilerConfig, sources, environment, file} = baseConfig;
  const {rootDir} = sources;
  const {isDev} = environment;
  const baseExclude = /^(.*?\/)?(?:src|lib|packages|node_modules)\/.+\.jsx?$/;
  const {
    presets,
    tasks: boilerTasks,
    babelExclude: excludeRe = baseExclude
  } = boilerConfig;

  const boilerData = getBoilerDeps(rootDir, {
    tasks: boilerTasks,
    presets
  });
  const taskNames = Object.keys(boilerData || {});
  const plugins = getGulpPlugins(baseConfig, taskNames);

  /**
   * Because in `babelrc` it is very hard to use minimatch to
   * exclude/include files for `babel-register` to process, we
   * use `babel` inside `require-hacker` to process files from
   * `process.cwd()/gulp/**
   */
  const hook = hacker.hook('js', hackedPath => {
    const shouldInclude = include ?
      include.test(hackedPath) :
      !excludeRe.test(hackedPath)
    ;
    const isInternal = hackedPath.replace(rootDir, '').indexOf('boiler-') !== -1;
    let compiled;

    if (shouldInclude && !isInternal) {
      compiled = babel.transformFileSync(hackedPath, {
        sourceRoot: path.dirname(hackedPath)
      }).code;
    }

    return compiled;
  });

  const parentConfig = {};

  /**
   * Try to get the config from `root/gulp/config/index`
   */
  const parentData = tryExists(
    join(process.cwd(), 'gulp', 'config', 'index.js')
  );

  if (parentData) {
    Object.assign(parentConfig, parentData);
    log(`Merging parent ${blue('gulp/config')} with base config`);
  }

  addTaskName(gulp);

  process.env.NODE_ENV = isDev ? 'development' : 'production';

  //hack for karma, ternary was making `undefined` a string
  if (file) {
    process.env.TEST_FILE = file;
  }

  /**
   * Combine the base config from `boiler-config-base` =>
   *   - cliConfig
   *   - `boiler.config.js`
   *   - sources/environment/utils/pkg/boilerConfig etc
   * with the parent config hooks from `gulp/config/index.js`
   */
  const config  = getTaskConfig(baseConfig, parentConfig, {
    tasks: taskNames
  });

  const tasks = getTasks(gulp, plugins, config, boilerData);

  hook.unmount();

  return {
    tasks,
    config,
    plugins
  };
}
