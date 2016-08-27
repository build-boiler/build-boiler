const glob = require('globby');
const fs = require('fs');
const asyncMap = require('async').map;
const meow = require('meow');

const cli = meow(`
    Usage
      $ node ./scripts/change-org.js

    Options
      --replace, -r  Org/User to replace
      --add, -a  Org/User to replace with

    Examples
      $ node ./scripts/change-org.js -r dtothefp -a build-boiler
`, {
  alias: {
    r: 'replace',
    a: 'add'
  }
});

const {replace, add} = cli.flags;
const orgRe = new RegExp(`^(.+github.com/)${replace}(/.+)$`, 'gm');

if (!(replace && add)) process.exit(1);

function transformContents(fp, cb) {
  fs.readFile(fp, 'utf8', (err, content) => {
    if (err) return cb(err);

    const replaced = content.replace(orgRe, `$1${add}$2`);

    cb(null, {
      fp,
      content: replaced
    });
  });
}

function read(fps) {
  return new Promise((res, rej) => {
    asyncMap(fps, transformContents, (err, data) => {
      if (err) return rej(err);

      res(data);
    });
  });
}

function write(data) {
  return new Promise((res, rej) => {
    asyncMap(data, ({fp, content}, cb) => fs.writeFile(fp, content, cb), (err) => {
      if (err) return rej(err);

      res();
    });
  });
}

glob('packages/*/package.json')
  .then(read)
  .then(write)
  .catch(err => {
    console.error(err.message, err.stack);
    process.exit(1);
  });
