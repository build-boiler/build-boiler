import _ from 'lodash';
import {readdirSync as read, statSync as stat, existsSync as exists} from 'fs';
import path, {join} from 'path';
import hacker from 'require-hacker';
import boilerUtils from 'boiler-utils';
import makeConfig from 'boiler-config-base';
import getBoilerDeps from './utils/parse-config';
import getGulpPlugins from './get-gulp-plugins';
import getTaskConfig from './get-boiler-task-config';

export default function(gulp, opts = {}) {
  const babel = require('babel-core');
  const {
    gulpTaskname: addTaskName,
    renameKey,
    buildLogger,
    removeExtension: removeExt,
    tryExists
  } = boilerUtils;
  const {log, blue} = buildLogger;
  const {include} = opts;
  const baseConfig = makeConfig();
  /**
   * Config from `boiler.config.js`
   */
  const {boilerConfig, sources, utils, environment, file} = baseConfig;
  const {rootDir, taskDir} = sources;
  const {addbase} = utils;
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
    let compiled;

    if (shouldInclude && hackedPath.indexOf(rootDir) === -1) {
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

  /**
   * Reqires all gulp tasks passing the `gulp` object, all `plugins` and `config` object
   * Eliminates a lot of
   * @param {String} taskPath
   * @param {Function|Callback} supplied as `gulp.task`
   */
  function getTask(taskPath, moduleTask, fn) {
    fn = fn || require(taskPath);
    let parentMod;

    if (moduleTask) {
      let foundPath;

      try {
        const parentPath = path.join(
          process.cwd(),
          'gulp',
          'tasks',
          taskPath
        );

        const filePath = `${parentPath}.js`;
        const dirPath = join(parentPath, 'index.js');

        if (exists(filePath)) {
          foundPath = filePath;
        } else if (exists(dirPath)) {
          foundPath = dirPath;
        }

        if (foundPath) {
          parentMod = require(foundPath);
          log(`Parent task found at ${blue(renameKey(foundPath))}`);
        }
      } catch (err) {
        /**
         * If the file exists but couldn't be compiled then show the error
         */
        if (foundPath) {
          throw err;
        }
      }
    } else {
      log(`Custom task found at ${blue(renameKey(taskPath))}`);
    }

    return moduleTask ?
      fn(gulp, plugins, config, parentMod) :
      fn(gulp, plugins, config);
  }


  /**
   * Creates an object with keys corresponding to the Gulp task name and
   * values corresponding to the callback function passed as the second
   * argument to `gulp.task`
   * @param {String} basePath path to directory
   * @param {Array} dirs array of filepaths/direcotries
   * @param {Boolean} isModule flag of whether to look up at parent tasks
   * @return {Object} map of task names to callback functions to be used in `gulp.task`
   */
  function recurseTasks(basePath, dirs, isModule) {
    return dirs.reduce((acc, name) => {
      const taskPath = join(basePath, name);
      let isDir = stat(taskPath).isDirectory();
      let taskName;
      if (isDir) {
        if ( !exists(join(taskPath, 'index.js')) ) {
          throw new Error(`task ${name} directory must have filename index.js`);
        }
        taskName = name;
      } else {
        taskName = removeExt(name);
      }


      return {
        ...acc,
        [ _.camelCase(taskName) ]: getTask(taskPath, isModule)
      };
    }, {});
  }

  const internalDirs = Object.keys(boilerData);
  const parentDir = addbase(taskDir, 'tasks');
  const moduleTasks = internalDirs.reduce((acc, name) => ({
    ...acc,
    [_.camelCase(name)]: getTask(name, true, boilerData[name])
  }), {});
  let parentTasks = {};

  const parentPaths = read(parentDir).filter(fp => {
    const base = fp.replace(path.extname(fp), '');

    return !internalDirs.includes(base);
  });

  parentTasks = recurseTasks(parentDir, parentPaths);

  hook.unmount();

  const tasks = {
    ...parentTasks,
    ...moduleTasks
  };

  return {
    tasks,
    config,
    plugins
  };
}
