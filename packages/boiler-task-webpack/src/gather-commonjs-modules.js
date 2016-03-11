import _ from 'lodash';
import fs from 'fs';

export default function(config) {
  const {isomorphic, pkg, utils} = config;
  const {
    include = {},
    exclude = {}
  } = isomorphic.modules || {};
  const {addbase} = utils;
  const {dependencies} = pkg;
  let hfaDir = [];

  try {
    hfaDir = fs.readdirSync(addbase('node_modules', '@hfa'));
  } catch (err) {/*eslint no-empty:0*/}

  const hfaMods = hfaDir.reduce((list, hfaMod) => {
    let deps;

    try {
      deps = fs.readdirSync(addbase('node_modules', `@hfa/${hfaMod}`, 'node_modules'));
    } catch (err) {
      deps = [];
    }

    return [...list, ...deps];
  }, []);

  const blacklist = [].concat(include);
  const whitelist = [
    'formidable'
  ].concat(exclude);

  const allDeps = _.union(
    dependencies,
    hfaMods,
    pkg,
    whitelist
  );

  function filterDeps(dep) {
    const isBin = ['.bin'].indexOf(dep) !== -1;
    const isHfa = /^@hfa\/?.*$/.test(dep);
    const isBlacklist = blacklist.indexOf(dep) !== -1;
    const shouldExclude = isBin || isHfa || isBlacklist;

    return !shouldExclude;
  }

  return allDeps
    .filter(filterDeps)
    .reduce((acc, mod) => ({
      ...acc,
      [mod]: `commonjs ${mod}`
    }), {});
}
