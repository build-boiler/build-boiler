import nunjucks from 'nunjucks';
import consolidate from 'consolidate';
import addTags from './tags';
import addFilters from './filters';

export default function(app, opts = {}) {
  const {
    ext = '.html',
    ...rest
  } = opts;
  const nunj = nunjucks.configure({
    watch: false,
    noCache: true
  });

  app.engine(ext, consolidate.nunjucks);
  addTags(nunj, app, rest);
  addFilters(nunj, rest);

  const globalFns = [
    'headScripts',
    'layouts',
    'macros',
    'partials'
  ];

  const {data} = app.cache || {};

  /**
   * Expose utility functions globally so they can
   * be used in the macro context
   */
  globalFns.forEach(name => {
    if (name in data) {
      nunj.addGlobal(name, data[name]);
    }
  });

  return nunj;
}
