import path from 'path';
import {statSync} from 'fs';
import findUp from 'findup-sync';

/**
 * Check if a file/directory exists and if so `require` it
 * @param {String} fp filepath
 * @param {String} name filename to append to dir path
 * @param {Boolean} resolve use `require.resolve` to check if `fp` is a module
 *
 * @return {Any|undefined}
 */
export default function(fp, opts = {}) {
  const {
    omitReq,
    resolve,
    name,
    lookUp,
    throwOn
  } = opts;
  let exists, req;

  /*eslint brace-style:0*/
  try {
    /**
     * find the file using `require.resolve`
     * useful for modules
     */
    if (resolve) {
      req = require.resolve(fp);
      exists = true;
    }
    /**
     * find the file by looking up directories
     * using `find-up-sync`
     */
    else if (lookUp) {
      req = findUp(fp);
      exists = !!req;
    }
    /**
     * If not options are passed by default
     * find the file/directory using `fs.statSync`
     */
    else {
      const stat = statSync(fp);
      exists = true;

      if (stat.isFile()) {
        req = fp;
      }

      if (!req && stat.isDirectory()) {
        req = name ? path.join(fp, name) : fp;
      }

    }
  } catch (err) {
    if (throwOn) throw err;
  }

  if (exists && !omitReq) {
    const mod = require(req);

    //HACK: sometimes there is a `default` key
    exists = mod.default || mod;
  }

  return omitReq ? req : exists;
}
