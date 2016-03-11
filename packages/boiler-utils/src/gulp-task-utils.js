import path from 'path';
import {PluginError} from 'gulp-util';
import {log, blue, magenta} from './build-logger';

export default  {
  /**
   * Create a file path from the base/root
   * @param {String|undefined} root
   * @return {Function}
   */
  addbase(root) {
    /**
     * @param {Array} args arguments passed to `pathl.join
     * @return {String} filepath from base/root
     */
    return (...args) => {
      const base = [root || process.cwd()];
      const allArgs = [...base, ...args];

      return path.join(...allArgs);
    };
  },
  /**
   * Get the Gulp task name splitting on ":"
   * @param {String} task the gulp task name as defined in the `gulpfile`
   * @return {String} task name following the ":"
   */
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
  /**
   * Log a gulp plugin error and exit the process
   * @param {Object} err instance of `Error`
   * @param {String} plugin the plugin name
   * @return {Null} exits the `process`
   */
  logError({err, plugin}) {
    const pluginErr = new PluginError(plugin, err, {showStack: true});

    log(magenta(pluginErr.plugin));
    log(blue(pluginErr.message));
    log(pluginErr.stack);
    process.exit(1);
  },
  /**
   * Trims `/` if it exists at the end of a string
   * @param {String} fp
   * @return {String}
   */
  trim(fp) {
    return fp.lastIndexOf('/') === fp.length - 1 ? fp.slice(0, -1) : fp;
  }
};

