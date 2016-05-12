const path = require('path');
const glob = require('globby').sync;
const write = require('fs').writeFileSync;

const {argv} = process;
const versionI = argv.indexOf('-v');
const force = argv.includes('--force');
let version;

if (versionI > -1) {
  ([version] = argv.slice(versionI + 1, versionI + 2));
} else {
  const {version: pkgVersion} = require(
    path.join(process.cwd(), 'lerna.json')
  );
  version = Math.floor(pkgVersion) + 1;
}

if (!version) throw new Error('No version specified');
if (version.split('.').length !== 3) throw new Error('Invalid semver version');

const pkgs = glob('packages/*/package.json');
const ENDS_WITH_NEW_LINE = /\n$/;

function ensureEndsWithNewLine(string) {
  return ENDS_WITH_NEW_LINE.test(string) ? string : string + '\n';
}

pkgs.forEach((fp) => {
  const json = require(
    path.join(process.cwd(), fp)
  );

  if (parseFloat(json.version) < parseFloat(version) || force) {
    const content = JSON.stringify(
      Object.assign({}, json, {version}),
      null,
      '  '
    );
    write(fp, ensureEndsWithNewLine(content));
  }
});
