import _ from 'lodash';
import Assemble from 'assemble-core';
import matter from 'parser-front-matter';
import {readJsonSync} from 'fs-extra';
import consolidate from 'consolidate';
import {safeLoad} from 'js-yaml';
import {readFileSync} from 'fs';
import path from 'path';
import buildNunjucksConfig from './nunjucks-config';
import Plasma from 'plasma';
import makeTools from '../webpack/isomorpic-tools';
import renameKey from '../../utils/rename-key';

export default function(gulp, plugins, config) {
  const {browserSync, gutil} = plugins;
  const {colors, log} = gutil;
  const {blue} = colors;
  const {sources, utils, environment} = config;
  const {
    srcDir,
    buildDir,
    libraryName,
    globalStatsFile
  } = sources;
  const {addbase, logError} = utils;
  const {isDev} = environment;
  const plasma = new Plasma();
  const app = new Assemble();
  const src = addbase(srcDir, 'templates/pages/**/*.html');
  const globalStatsPath = addbase(buildDir, globalStatsFile);
  const tools = makeTools(_.assign({}, config, {
    isPlugin: false,
    isMainTask: true
  }));

  if (isDev) {
    const watch = require('base-watch');
    app.use(watch());
  }

  plasma.dataLoader('yml', function(fp) {
    const str = readFileSync(fp, 'utf8');
    return safeLoad(str);
  });

  //app.data(plasma.load(addbase('config/**/*.yml'), {namespace: true}));

  app.data({
    libraryName,
    userName: process.cwd().split('/')[2],
    sources,
    environment,
    join: path.join,
    layouts(fp) {
      return `${addbase(srcDir, 'templates/layouts', fp)}.html`;
    }
  });

  buildNunjucksConfig(app);

  app.engine('.html', consolidate.nunjucks);

  app.option('renameKey', (fp) => {
    const dirname = path.dirname(fp).split('/').slice(-1)[0];
    const basename = path.basename(fp).split('.').slice(0)[0];
    return `${dirname}/${basename}`;
  });

  app.onLoad(/\.(?:hbs|md|html)$/, (file, next) => {
    matter.parse(file, (err, file) => {
      if (err) return next(err);

      next(null, file);
    });
  });

  /**
   * Create the isomorphic "snippets"
   */
  return (cb) => {
    app.task('build', () => {
      let stream = app.src(src)
        .pipe(app.renderFile())
        .pipe(app.dest(buildDir))
        .on('data', (file) => {
          log(`Rendered ${blue(renameKey(file.path))}`);
        })
        .on('error', (err) => {
          logError({err, plugin: '[assemble]: build'});
        });

      if (isDev) {
        stream = stream.pipe(browserSync.stream());
      }

      return stream;
    });

    app.task('watch', ['build'], () => {
      app.watch(addbase(srcDir, 'templates/**/*.html'), ['build']);
      cb();
    });

    const statsDir = addbase(buildDir);

    tools.development(isDev).server(statsDir).then(() => {
      const globalStats = readJsonSync(globalStatsPath);
      const assets = _.merge({}, tools.assets(), _.omit(globalStats, 'assets'), {images: globalStats.assets});
      app.data({assets});

      app.build(isDev ? ['watch'] : ['build'], (err) => {
        if (err) {
          logError({err, plugin: '[assemble]: run'});
        }
        cb();
      });
    }).catch((err) => {
      logError({err, plugin: '[assemble: server]'});
    });
  };
}
