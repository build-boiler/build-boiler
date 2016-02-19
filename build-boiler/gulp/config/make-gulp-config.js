import _ from 'lodash';
import {readdirSync as read, statSync as stat, existsSync as exists} from 'fs';
import path, {join} from 'path';
import {sync as parentSync} from 'find-parent-dir';
import makeConfig from './';
import makeCliConfig from './make-cli-config';
import compile from '../utils/compile-module';
import addTaskName from '../utils/gulp-taskname';
import renameKey from '../utils/rename-key';

export default function(gulp) {
  const babel = require('babel-core');
  const parentDist = parentSync(__dirname, 'dist');
  const parentMod = parentSync(__dirname, 'node_modules');
  const rootDir = parentMod || parentDist || path.resolve(__dirname, '..', '..');
  const {cliConfig, plugins} = makeCliConfig(rootDir);
  let parentConfig;

  try {
    parentConfig = require(join(process.cwd(), 'gulp', 'config', 'index.js'));
    console.log('Merging parent `gulp/config` with base config [build-boiler]');
  } catch (err) {
    console.log('No provided root config, using base config in [build-boiler]');
  }

  const config = makeConfig(cliConfig, rootDir, parentConfig);
  const {sources, utils} = config;
  const {taskDir} = sources;
  const {addbase, addroot} = utils;

  addTaskName(gulp);

  process.env.NODE_ENV = config.ENV;
  //hack for karma, ternary was making `undefined` a string
  if (config.file) {
    process.env.TEST_FILE = config.file;
  }

  /**
   * Reqires all gulp tasks passing the `gulp` object, all `plugins` and `config` object
   * Eliminates a lot of
   * @param {String} taskPath
   * @param {Function|Callback} supplied as `gulp.task`
   */
  function getTask(taskPath, moduleTask) {
    const fn = require(taskPath);
    let parentMod;

    if (moduleTask) {
      try {
        let parentPath = path.join(
          process.cwd(),
          taskPath.replace(rootDir, '')
        );

        if (!/\.js?$/.test(parentPath)) {
          parentPath += '/index.js';
        }
        const {code} = babel.transformFileSync(parentPath);
        parentMod = compile(code);
      } catch (err) {
        console.log(`No parent task for ${renameKey(taskPath)}`);
      }
    }

    return fn(gulp, plugins, config, parentMod);
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
        taskName = path.basename(name, '.js');
      }


      return {
        ...acc,
        [ _.camelCase(taskName) ]: getTask(taskPath, isModule)
      };
    }, {});
  }

  const tasksDir = addroot(taskDir, 'tasks');
  const internalDirs = read(tasksDir);
  const moduleTasks = recurseTasks(tasksDir, internalDirs, true);
  const parentDir = addbase(taskDir, 'tasks');
  let parentTasks = {};

  /*eslint no-empty:0*/
  try {
    const parentPaths = read(parentDir).filter(fp => !internalDirs.includes(fp));

    parentTasks = recurseTasks(parentDir, parentPaths);
    console.log(`Merging Gulp Tasks from ${parentDir}`);
  } catch (err) {
    console.log(`No custom tasks in ${parentDir}`);
  }

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
