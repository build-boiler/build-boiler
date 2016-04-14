import path from 'path';
import jsdom from 'jsdom';
import boilerUtils from 'boiler-utils';
import {sync as globSync} from 'globby';

/**
 * Loader to compile React components and es6 functions with Webpack
 * memory-fs and put them on the `snippets` Assemble collection
 *
 * @param {Object} collection instance provided by assemble
 *
 * @return {Function} function re-defining a `load` method
 */
export default function(collection) {
  const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
  const win = doc.defaultView;

  if (!global.document) global.document = doc;
  if (!global.window) global.window = win;
  if (!global.navigator) global.navigator = win.navigator;

  const {buildLogger, renameKey} = boilerUtils;
  const {log, blue} = buildLogger;

  /**
   * @param {Object} data any additional context
   * @param {Function} cb callback to be called at the end
   *
   * @return {undefined} use the cb
   */
  collection.load = (config, cb) => {
    const {
      utils,
      sources,
      isomorphic
    } = config;
    const {serverDir, scriptDir} = sources;
    const {addbase} = utils;
    const {
      base,
      entries,
      memory,
      output
    } = isomorphic;
    const outDir = output || serverDir;
    let files;

    try {
      const entryGlobs = entries.map(e => path.join('**', renameKey(e, {ext: true})));

      files = globSync(entryGlobs, {cwd: outDir}).map(fp => {
        const name = renameKey(fp, {base});
        return addbase(
          outDir,
          base ? name : path.join(scriptDir, name.replace(scriptDir, ''))
        );
      });
    } catch (err) {
      throw new Error('You must add isomorphic data to `gulp/config/index.js`');
    }

    if (!memory) {
      files.forEach(file => {
        log(`Requiring Isomorphic ${blue(renameKey(file))} component`);
        collection.addView(file, {
          path: file,
          contents: '',
          fn: require(file)
        });
      });

      cb(null);
    }
  };
}
