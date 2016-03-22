const gutil = require('gulp-util');
const path = require('path');
const fs = require('fs');
const colors = gutil.colors;
const log = gutil.log;
const spawn = require('child_process').spawnSync;
const rootDir = path.resolve(__dirname, '..');
const packageDirs = fs.readdirSync(
  path.join(rootDir, 'packages')
).filter(dir => dir[0] !== '.');

packageDirs.forEach(dir => {
  const pkg = require(
    path.join(rootDir, 'packages', dir, 'package.json')
  );

  const deps = pkg.dependencies;
  const re = /boiler-/;
  const externalDeps = Object.keys(deps).reduce((list, name) => {
    if (!re.test(name)) {
      const version = deps[name];
      const dep = `${name}@${version}`;

      list.push(dep);
    }

    return list;
  }, []);

  if (externalDeps.length) {
    const dirPath = path.join('packages', dir);
    log(`Installing external deps for ${colors.magenta(dir)}:\n  ${colors.blue(externalDeps.join('\n  '))}`);
    spawn('npm', [
      'install',
    ].concat(externalDeps), {stdio: 'inherit', cwd: dirPath});

    try {
      const etcPath = path.join(dirPath, 'etc');
      const stat = fs.statSync(etcPath);

      if (stat.isDirectory()) {
        fs.rmdirSync(etcPath);
      }
    } catch (err) {
      //eslint-disable-line no-empty
    }
  }
});
