import path from 'path';
import isNumber from 'lodash/isNumber';
import isPlainObject from 'lodash/isPlainObject';

/**
 * Function to be added to the `assemble` template context
 * @param {Object} config `boiler-config`
 * @param {String|Array|Object|function} data parent data passed into assemble config
 *
 * @return {Object} functions to be added to template context
 */
export default function(config, data) {
  const {sources, utils} = config;
  const {scriptDir, srcDir, templateDir} = sources;
  const {addbase} = utils;

  //HACK: to dynamically add the branch in the search path
  const branch = isPlainObject(data) && data.branch || '';
  const srcPath = path.join(srcDir, branch);

  function makeTemplatePath(dir) {
    return (fp) => `${addbase(srcPath, templateDir, dir, fp)}.html`;
  }

  function makeJSPath(dir) {
    return (fp) => `${path.join(srcPath, scriptDir, dir, fp)}.js`;
  }

  function join(...args) {
    //allow Number in filepath, must convert to String or `path.join` yells
    const normalizedArgs = args.map(arg => isNumber(arg) ? `${arg}` : arg);

    return path.join(...normalizedArgs);
  }

  return {
    join,
    headScripts: makeJSPath('head-scripts'),
    layouts: makeTemplatePath('layouts'),
    macros: makeTemplatePath('macros'),
    partials: makeTemplatePath('partials')
  };
}
