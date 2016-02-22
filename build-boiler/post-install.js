import 'babel-polyfill';
import ncp from 'ncp';
import {ensureDir} from 'fs-extra';
import path from 'path';
import {log, colors} from 'gulp-util';
import thunk from './gulp/utils/thunk';
import run from './gulp/utils/run-gen';

const {magenta, blue} = colors;
const moduleDir = 'node_modules';
const [directParent] = __dirname.split(path.sep).slice(-1);
const [secondParent] = __dirname.split(path.sep).slice(-2);
const parentIsDist = directParent === 'dist';
const parentIsMod = secondParent === moduleDir;
const force = process.argv.indexOf('force') !== -1;
const copyDir = path.join(__dirname, 'test-config');
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

run(function *() {

  if (parentIsDist || force) {
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

  } else if (parentIsMod || force) {
    const srcDir = path.join(process.cwd(), 'test');

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
