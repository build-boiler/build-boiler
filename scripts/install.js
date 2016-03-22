const async = require('async');
const assign = require('lodash/assign');
const gutil = require('gulp-util');
const path = require('path');
const fs = require('fs');
const colors = gutil.colors;
const log = gutil.log;
const child = require('child_process');
const rootDir = path.resolve(__dirname, '..');
const packageDir = 'packages';
const packageDirs = fs.readdirSync(
  path.join(rootDir, packageDir)
).filter(dir => dir[0] !== '.');
const spawn = child.spawn;
const exec = child.execSync;

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

const thunkCp = (dir, deps, cb) => {
  const dirPath = path.join('packages', dir);

  log(`Installing external deps for ${colors.magenta(dirPath)}:\n  ${colors.blue(deps.join('\n  '))}\n`);

  const cp = spawn('npm', [
    'install'
  ].concat(deps), {stdio: 'inherit', cwd: dirPath});

  cp.on('close', (code) => {
    try {
      const etcPath = path.join(dirPath, 'etc');
      const stat = fs.statSync(etcPath);

      if (stat.isDirectory()) {
        fs.rmdirSync(etcPath);
      }
    } catch (err) {
      //eslint-disable-line no-empty
    }

    code ? cb(code) : cb(null, code);
  });
};

const tasks = packageDirs.map(dir => {
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

  return (cb) => {
    if (externalDeps.length) {
      thunkCp(dir, externalDeps, cb);
    } else {
      cb(null);
    }
  };
});

exec('npm config set progress=false');

async.parallelLimit(tasks, 2, (err, result) => {
  exec('npm config set progress=true');
  if (err) return console.log(err);
});
