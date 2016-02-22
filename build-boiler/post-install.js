import 'babel-polyfill';
import {sync as parentSync} from 'find-parent-dir';
import ncp from 'ncp';
import {ensureDir} from 'fs-extra';
import path from 'path';
import {log, colors} from 'gulp-util';
import thunk from './gulp/utils/thunk';
import run from './gulp/utils/run-gen';

const {magenta, blue} = colors;
const parentPath = parentSync(__dirname, 'node_modules');
const split = parentPath && parentPath.split(path.sep);
const parentMod = Array.isArray(split) && split.filter(dir => dir !== 'node_modules').join(path.sep);
const internalMod = parentSync(__dirname, 'dist');
const directParent = __dirname.split(path.sep).slice(-1)[0];
const parentIsDist = directParent === 'dist';
const force = process.argv.indexOf('force') !== -1;
const copyDir = path.join(__dirname, 'test-config');
const srcDir = path.join(parentMod, 'test');
const copy = thunk(ncp);
const ensure = thunk(ensureDir);

function* createTestConfig({src, dest, action}) {
  let ret, dirs;

  switch (action) {
    case 'ensure':
      dirs = [
        '',
        'integration',
        path.join('e2e', 'desktop'),
        path.join('e2e', 'mobile')
      ];

      ret = dirs.map(dir => {
        log(`${blue('[build-boiler]')}: Ensuring that ${magenta(dir || 'test')} exists in ${blue(dest)}\n`);

        return ensure(path.join(dest, dir));
      });
      break;
    break;
    case 'copy':
      dirs = [
        'config'
      ];

      ret = dirs.map(dir => {
        log(`${blue('[build-boiler]')}: Trying to copy ${magenta(dir)} to ${blue(dest)}\n`);

        return copy(path.join(src, dir), path.join(dest, dir), {clobber: false});
      });
      break;
  }

  for (const future of ret) {
    try {
      yield future;
    } catch (err) {
      log(`${blue('[build-boiler]')}: Error ${magenta(action)}ing to ${blue(dest)} directory\n`, err.stack);
    }
  }

  return ret;
}

if (parentMod || force) {
  run(function *() {

    if (parentIsDist) {
      const internalSrc = path.resolve(directParent, '..', '..', 'test');

      yield* createTestConfig({
        dest: internalSrc,
        action: 'ensure'
      });

      yield* createTestConfig({
        src: copyDir,
        dest: internalSrc,
        action: 'copy'
      });

    } else {

      yield* createTestConfig({
        dest: srcDir,
        action: 'ensure'
      });

      yield* createTestConfig({
        src: copyDir,
        dest: srcDir,
        action: 'copy'
      });

    }
  });
}
