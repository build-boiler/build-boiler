import {readdirSync as read, statSync as stat, existsSync as exists} from 'fs';
import _ from 'lodash';
import path, {join} from 'path';
import makeConfig from './';
import baseConfig from './make-cli-config';
import '../utils/gulp-taskname';

export default function(gulp) {
  const {cliConfig, plugins} = baseConfig;
  const config = makeConfig(cliConfig);
  const {sources, utils} = config;
  const {taskDir} = sources;
  const {addroot} = utils;

  gulp.Gulp.prototype.__runTask = gulp.Gulp.prototype._runTask;
  gulp.Gulp.prototype._runTask = function(task) {
    this.currentTask = task;
    this.__runTask(task);
  };

  try {
    const parentConfig = require(addroot('gulp', 'config'));

    _.assign(config, _.omit(parentConfig, ['ENV']));
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
      const parentPath = taskPath.replace(__dirname, process.cwd());
      parentMod = require(parentPath);
    } catch (err) {
      console.log(`No parent task for ${taskPath}`);
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
