import fs from 'fs';
import path from 'path';
import _ from 'lodash';

/**
 * Require all files in a directory and place them in an obect
 * by path name or an array by value
 * @param {String} dirPath path to the directory
 * @param {Object} opts options
 * @param {Boolean} opts.recurse
 * @param {String|Array} opts.ignore filepath name to ignore
 * @param {Boolean} opts.dict return an Object rather than an Array
 * @return {Array|Object}
 */
export default function(dirPath, opts = {}) {
  const {recurse, dict, ignore: ogIgnore} = opts;
  const ignore = [];

  if (ogIgnore) {
    Array.isArray(ogIgnore) ? ignore.push(...ogIgnore) : ignore.push(ogIgnore);
  }

  return (function recurseDirs(passedPath) {
    const fps = fs.readdirSync(passedPath);

    return fps.reduce((acc, fp) => {
      const name = path.basename(fp, path.extname(fp));
      const shouldProceed = ignore.indexOf(name) === -1;

      if (shouldProceed) {
        const fullPath = path.join(passedPath, fp);
        const isDir = fs.statSync(fullPath).isDirectory();
        let data;

        if (isDir && recurse) {
          data = recurseDirs(fp);
          dict ? _.assign(acc, data) : acc.push(...data);
        } else {
          data = require(fullPath);

          if (_.isString(dict) && dict === 'dirname') {
            const key = path.basename(
              fullPath,
              path.extname(fullPath)
            );
            _.assign(acc, {[_.camelCase(key)]: data});
          } else if (dict) {
            _.assign(acc, {[fullPath]: data});
          } else {
            acc.push(data);
          }

        }
      }

      return acc;
    }, dict ? {} : []);

  })(dirPath);
}
