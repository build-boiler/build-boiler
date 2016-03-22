const assign = require('lodash/assign');
const gutil = require('gulp-util');
const path = require('path');
const fs = require('fs');
const colors = gutil.colors;
const log = gutil.log;
const spawn = require('child_process').spawnSync;
const rootDir = path.resolve(__dirname, '..');
const packageDir = 'packages';
const packageDirs = fs.readdirSync(
  path.join(rootDir, packageDir)
).filter(dir => dir[0] !== '.');

if (process.env.TRAVIS_BRANCH) {
  const yml = require('js-yaml');
  const travisPath = path.join(process.cwd(), '.travis.yml');
  const travisConfig = yml.safeLoad(
    fs.readFileSync(travisPath)
  );
  const directories = packageDirs.reduce((list, dir) => ([
    ...list,
    path.join(packageDir, dir, 'node_modules')
  ]), ['node_modules']);
  const newYml = assign({}, travisConfig, {cache: directories});

  fs.writeFileSync(
    travisPath,
    yml.safeDump(newYml, {indent: 0})
  );
}

packageDirs.forEach(dir => {
  const pkg = require(
    path.join(rootDir, packageDir, dir, 'package.json')
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
      'install'
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
