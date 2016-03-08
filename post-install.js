import 'babel-polyfill';
import ncp from 'ncp';
import {path as rootPath} from 'app-root-path';
import {ensureDir} from 'fs-extra';
import path from 'path';
import {log, colors} from 'gulp-util';
import thunk from './gulp/utils/thunk';
import run from './gulp/utils/run-gen';

const {magenta, blue} = colors;
const moduleDir = 'node_modules';
const splitPath = __dirname.split(path.sep);
const [directParent] = splitPath.slice(-1);
const [secondParent] = splitPath.slice(-2);
const parentIsDist = directParent === 'dist';
const parentIsMod = secondParent === moduleDir;
const force = process.argv.indexOf('force') !== -1;
const copyDir = path.join(__dirname, 'test-config');
const copy = thunk(ncp);
const ensure = thunk(ensureDir);
const testDir = 'test';

function* createTestConfig({src, dest, action}) {
  let ret, dirs;

  switch (action) {
    case 'ensure':
      dirs = [
        '',
        'integration',
        'e2e'
      ];

      ret = dirs.map(dir => {
        log(`${blue('[build-boiler]')}: Ensuring that ${magenta(dir || testDir)} exists in ${blue(dest)}\n`);

        return ensure(path.join(dest, dir));
      });
      break;
    case 'copy':
      dirs = [
        'config',
        'README.md'
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

const shouldRun = parentIsMod || parentIsDist || force;

if (shouldRun) {
  const srcDir = parentIsMod ?
    path.join(rootPath, testDir) :
    path.resolve(__dirname, '..', '..', testDir);

  run(function *() {
    yield* createTestConfig({
      dest: srcDir,
      action: 'ensure'
    });

    yield* createTestConfig({
      src: copyDir,
      dest: srcDir,
      action: 'copy'
    });
  });
}
