import _ from 'lodash';
import path, {join} from 'path';
import {readdirSync as read, statSync as stat, existsSync as exists} from 'fs';
import boilerUtils from 'boiler-utils';

export default function(gulp, plugins, config, boilerData) {
  const {boilerConfig, sources, utils} = config;
  const {taskDir} = sources;
  const {addbase} = utils;
  const {
    renameKey,
    buildLogger,
    removeExtension: removeExt
  } = boilerUtils;
  const {log, blue} = buildLogger;
  const {addons} = boilerConfig;

  /**
   * Reqires all gulp tasks passing the `gulp` object, all `plugins` and `config` object
   * Eliminates a lot of
   * @param {String} taskPath
   * @param {Function|Callback} supplied as `gulp.task`
   */
  function getTask(taskPath, moduleTask, fn) {
    fn = fn || require(taskPath);
    let parentMod, fnArgs;

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

    //TODO: figure out why module exports babel plugin isn't working
    const gulpFn = fn.default || fn;

    if (moduleTask) {
      fnArgs = {
        fn: parentMod,
        addons: addons[taskPath]
      };
    }

    //lazy load the task so it only calls the function when gulp uses it
    //HACK: without the `cb` argument the currying causes a gulp cb called too many times error
    //only necessary in gulp 3
    return function(cb) {
      const metaData = gulp.metaData || this;
      const taskFn = gulpFn(
        gulp,
        plugins,
        //add `metaData` from `this`
        Object.assign({}, config, metaData),
        fnArgs
      );

      return taskFn.apply(this, arguments);
    };
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
      const isDir = stat(taskPath).isDirectory();
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
  let parentPaths;

  try {
    parentPaths = read(parentDir).filter(fp => {
      const base = fp.replace(path.extname(fp), '');

      return !internalDirs.includes(base);
    });

    parentTasks = recurseTasks(parentDir, parentPaths);
  } catch (err) {
    if (parentPaths) {
      throw err;
    }
  }

  return {
    ...parentTasks,
    ...moduleTasks
  };
}
