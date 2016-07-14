import Plasma from 'plasma';
import isPlainObject from 'lodash/isPlainObject';
import {safeLoad} from 'js-yaml';
import {readFileSync} from 'fs';
import {readJsonSync} from 'fs-extra';


/**
 * Instantiate a new plasma instance
 * https://github.com/jonschlinkert/plasma
 * @param {Object} opts options
 * @param {Any} opts.namespace options on how to name space data
 * @param {String|Array} opts.ext extensions to load from
 * @return {Function} wrapper around `plasma.load`
 */
export default function(opts = {}) {
  const {namespace, ext: extensions = []} = opts;
  const plasma = new Plasma(opts);
  let namespaceOpt;

  function readData(ext) {
    const readYml = (fp) => readFileSync(fp, {encoding: 'utf8'});
    const noop = (data) => data;
    let readFn, processor;

    switch (ext) {
      case 'yml':
        readFn = readYml;
        processor = safeLoad;
        break;
      case 'json':
        readFn = readJsonSync;
        processor = noop;
        break;
      default:
        throw new Error('Must supply a yml or json extension');
    }

    return {readFn, processor};
  }

  function registerPlasma(ext) {
    if (isPlainObject(namespace)) {
      const {key, fn} = namespace;
      const dataKey = isPlainObject(key) ? key[ext] : key;

      plasma.dataLoader(ext, (fp) => {
        const {readFn, processor} = readData(ext);
        const fileData = readFn(fp);
        const data = {
          [dataKey]: processor(fileData)
        };

        return fn(fp, data);
      });

      namespaceOpt = false;
    } else {
      namespaceOpt = namespace;

      plasma.dataLoader(ext, (fp) => {
        const {readFn, processor} = readData(ext);
        const data = readFn(fp);

        return processor(data);
      });
    }
  }

  const exts = Array.isArray(extensions) ? extensions : [extensions];

  exts.forEach(registerPlasma);

  return (src) => {
    return plasma.load(src, {namespace: namespaceOpt});
  };
}
