import path from 'path';
import intersection from 'lodash/intersection';
import generateEslint from './generate-eslintrc';

/**
 * @param {Object}
 * @param {Boolean} opts.isDev
 * @param {String} opts.lintEnv
 *
 * @return {Object}
 */
export default function(opts) {
  const acceptedKeys = ['web', 'build', 'test'];
  const {
    generate,
    isDev,
    lintEnv,
    rules = {}
  } = opts;
  const resolve = path.resolve.bind(path, __dirname, 'config');
  const keys = Object.keys(rules);
  const hasCustomRules = keys.length && intersection(acceptedKeys, keys).length;
  let configFile;

  switch (lintEnv) {
    case 'build':
      if (generate) {
        generateEslint(opts);
      }

      configFile = resolve('build.js');
      break;
    case 'test':
      configFile = resolve('test.js');
      break;
    case 'web':
    // fallthrough
    default:
      configFile = resolve(`web-${isDev ? 'dev' : 'prod'}.js`);
      break;
  }

  return {
    rules: hasCustomRules ? rules[lintEnv] : rules,
    configFile,
    useEslintrc: false
  };
}
