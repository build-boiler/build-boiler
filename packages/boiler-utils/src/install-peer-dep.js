import path from 'path';
import {execSync} from 'child_process';
import {readJsonSync} from 'fs-extra';
import {log, blue, magenta} from './build-logger';
import tryExists from './try-exists';

/**
 * Webpack must be installed only once
 * https://github.com/webpack/webpack/issues/1082#issuecomment-189700673
 * @param {String} rootDir path to the root of `packages`
 * @param {String} addon the name of the `addon`
 *
 * @return {Array} if the installation occurred successfully
 */
export default function(rootDir, addon) {
  const prefix = 'boiler-addon-';
  const cwd = process.cwd();
  const pkgPath = path.join(
    rootDir,
    addon.indexOf(prefix) > -1 ? addon : prefix + addon,
    'package.json'
  );
  const {peerDependencies = {}} = require(pkgPath);
  const depNames = Object.keys(peerDependencies);
  const deps = depNames.reduce((list, name) => {
    const version = peerDependencies[name];
    const exists = tryExists(name, {resolve: true, omitReq: true});

    if (exists) {
      const re = new RegExp(`^(.*/node_modules/${name}/).*$`);
      const modulePath = exists.replace(re, '$1package.json');
      const {version: installedVersion} = readJsonSync(modulePath);

      if (installedVersion !== version) {
        list.push(`${name}@${version}`);
      }
    } else {
      list.push(`${name}@${version}`);
    }

    return list;
  }, []).join(' ');
  const installed = [];

  if (deps.length) {
    try {
      log(`Addon ${blue(addon)} Installing  ${magenta(deps)} to devDependencies`);
      execSync(`npm config set save-exact true && npm i -S ${deps}`, {cwd, stdio: 'inherit'});
      installed.push(...depNames);
    } catch (err) {
      const message = `Error installing ${deps}, please install in your project`;

      log(message);
    }
  }

  return installed;
}
