const path = require('path');
const glob = require('globby').sync;
const write = require('fs').writeFileSync;
const semver = require('semver');

const {argv} = process;
const versionI = argv.indexOf('-v');
const force = argv.includes('--force');
const all = argv.includes('--all');
const {version: lernaVersion} = require(
  path.join(process.cwd(), 'lerna.json')
);
let version;

if (versionI > -1) {
  version = semver.clean(
    argv.slice(versionI + 1, versionI + 2)[0]
  );
} else if (all) {
  version = semver.inc(lernaVersion, 'major');
}

/*eslint curly:0*/
if (!version)
  throw new Error('No version specified');
if (!semver.valid(version))
  throw new Error('Invalid semver version');
if (semver.lt(version, lernaVersion) && !force)
  throw new Error('Version must exceed Lerna version');

const pkgs = glob('packages/*/package.json');
const ENDS_WITH_NEW_LINE = /\n$/;

function ensureEndsWithNewLine(string) {
  return ENDS_WITH_NEW_LINE.test(string) ? string : string + '\n';
}

pkgs.forEach((fp) => {
  const json = require(
    path.join(process.cwd(), fp)
  );
  const {dependencies: deps} = json;
  const dependencies = Object.keys(deps).sort().reduce((acc, name) => {
    if (name.indexOf('boiler-') > -1) {
      acc[name] = `^${version}`;
    } else {
      acc[name] = deps[name];
    }

    return acc;
  }, {});

  if (semver.lt(json.version, version) || force) {
    const content = JSON.stringify(
      Object.assign({}, json, {version, dependencies}),
      null,
      '  '
    );
    write(fp, ensureEndsWithNewLine(content));
  }
});
