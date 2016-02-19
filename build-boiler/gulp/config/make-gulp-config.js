import {readdirSync as read, statSync as stat, existsSync as exists} from 'fs';
import _ from 'lodash';
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
  const config = makeConfig(cliConfig, rootDir);
  const {sources, utils} = config;
  const {taskDir} = sources;
  const {addbase, addroot} = utils;

  addTaskName(gulp);

  try {
    const parentConfig = require(addbase('gulp', 'config'));

    _.merge(config, _.omit(parentConfig, ['ENV']));
  } catch (err) {
    console.log('No provided root config, using base config in [build-boiler]');
  }

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
  function getTask(taskPath) {
    const fn = require(taskPath);
    let parentMod;

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

    return fn(gulp, plugins, config, parentMod);
  }

  const tasksDir = addroot(taskDir, 'tasks');

  /**
   * Creates an object with keys corresponding to the Gulp task name and
   * values corresponding to the callback function passed as the second
   * argument to `gulp.task`
   * @param {Array} all fill and directory names in the `gulp/task` directory
   * @return {Object} map of task names to callback functions to be used in `gulp.task`
   */
  const tasks = read(tasksDir).reduce((acc, name) => {
    const taskPath = join(tasksDir, name);
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
      [ _.camelCase(taskName) ]: getTask(taskPath)
    };
  }, {});

  return {
    tasks,
    config,
    plugins
  };
}
