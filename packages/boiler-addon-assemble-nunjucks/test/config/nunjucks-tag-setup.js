/*eslint space-after-keywords:0,guard-for-in:0,no-else-return:0,brace-style:0*/

/**
 * Taken from: https://github.com/mozilla/nunjucks/blob/master/tests/util.js
 * test examples for tags at: https://github.com/mozilla/nunjucks/blob/master/tests/compiler.j://github.com/mozilla/nunjucks/blob/master/tests/compiler.js
 */
import {cbToProm as promisify} from 'boiler-utils';
import {Environment, Template} from 'nunjucks/src/environment';
import {FileSystemLoader as Loader} from 'nunjucks/src/node-loaders';
import cloneDeep from 'lodash/cloneDeep';

const templatesPath = 'tests/templates';

function normEOL(str) {
  if (!str) return str;

  return str.replace(/\r\n|\r/g, '\n');
}

function render(str, ctx, opts, env, cb) {
  if(typeof ctx === 'function') {
    cb = ctx;
    ctx = null;
    opts = null;
    env = null;
  }
  else if(typeof opts === 'function') {
    cb = opts;
    opts = null;
    env = null;
  }
  else if(typeof env === 'function') {
    cb = env;
    env = null;
  }

  opts = cloneDeep(opts || {});
  opts.dev = true;
  const e = env || new Environment(new Loader(templatesPath), opts);
  let name;

  if(opts.filters) {
    for(name in opts.filters) {
      e.addFilter(name, opts.filters[name]);
    }
  }

  if(opts.asyncFilters) {
    for(name in opts.asyncFilters) {
      e.addFilter(name, opts.asyncFilters[name], true);
    }
  }

  if(opts.extensions) {
    for(name in opts.extensions) {
      e.addExtension(name, opts.extensions[name]);
    }
  }

  if(opts.globals) {
    for(name in opts.globals) {
      e.addGlobal(name, opts.globals[name]);
    }
  }

  ctx = ctx || {};

  const t = new Template(str, e);

  if(!cb) {
    return t.render(ctx);
  }
  else {
    t.render(ctx, function(err, res) {
      if(err && !opts.noThrow) {
        cb(err);
      }

      cb(err, normEOL(res));
    });
  }
}

export default promisify(render);
