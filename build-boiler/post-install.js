import {sync as parentSync} from 'find-parent-dir';
import ncp from 'ncp';
import path from 'path';
import {log, colors} from 'gulp-util';
import thunk from './gulp/utils/thunk';
import run from './gulp/utils/run-gen';

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

const {magenta, blue} = colors;
const parentMod = parentSync(__dirname, 'node_modules');
const internalMod = parentSync(__dirname, 'dist');
const force = process.argv.indexOf('force') !== -1;
const copyDir = path.join(__dirname, 'test-config');
const srcDir = path.join(parentMod, 'test', 'config');
const copy = thunk(ncp);

if (parentMod || force) {
  run(function *() {
    try {
      yield copy(copyDir, srcDir, {clobber: false});
    } catch (err) {
      log(`${blue('[build-boiler]')}: Error copying test config directory to ${srcDir}`, err.stack);
    }

    if (force) {
      const split = internalMod.split(path.sep);
      const [internalPath] = split.slice(-3);
      let configDirs = ['test', 'config'];
      let foundDir = false;
      const internalSrc = split.reduce((list, dir) => {
        if (foundDir && configDirs.length) {
          list.push(configDirs.shift());
        } else {
          list.push(dir);
        }

        if (dir === internalPath) foundDir = true;

        return list;
      }, []).join(path.sep);

      try {
        log(`${blue('[build-boiler]')}: Retrying copy to ${internalSrc}`);
        yield copy(copyDir, internalSrc, {clobber: true});
      } catch (err) {
        console.log(`${blue('[build-boiler]')}: Failed to copy ${internalSrc}`, err.stack);
      }
    }
  });
}
