import _ from 'lodash';
import Assemble from 'assemble-core';
import {readJsonSync} from 'fs-extra';
import consolidate from 'consolidate';
import {safeLoad} from 'js-yaml';
import {readFileSync} from 'fs';
import {join} from 'path';
import buildNunjucksConfig from './nunjucks-config';
import Plasma from 'plasma';
import addTags from './custom-tags';
import addMiddleware from './middleware';
import jsxLoader from './jsx-loader';
import isoMerge from './isomorphic-merge-plugin';
import makeTools from '../webpack/isomorpic-tools';
import renameKey from '../../utils/rename-key';
import callParent from '../../utils/run-parent-fn';
import runFn from '../../utils/run-custom-task';

export default function(gulp, plugins, config) {
  const {browserSync, gutil} = plugins;
  const {colors, log} = gutil;
  const {blue} = colors;
  const {
    assemble: assembleParentConfig,
    sources,
    utils,
    environment,
    webpackConfig
  } = config;
  const {
    srcDir,
    buildDir,
    globalStatsFile,
    templateDir
  } = sources;
  const {addbase, logError} = utils;
  const {isDev, enableIsomorphic} = environment;
  const plasma = new Plasma();
  const app = new Assemble();
  const templatePath = addbase(srcDir, templateDir);
  const src = join(templatePath, 'pages/**/*.html');
  const globalStatsPath = addbase(buildDir, globalStatsFile);
  const {
    data: parentData,
    registerTags
  } = assembleParentConfig;
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

  function makeTemplatePath(dir) {
    return (fp) => `${join(templatePath, dir, fp)}.html`;
  }

  app.data({
    sources,
    environment,
    webpackConfig,
    join,
    layouts: makeTemplatePath('layouts'),
    macros: makeTemplatePath('macros'),
    partials: makeTemplatePath('partials'),
    ...parentData
  });

  const nunj = buildNunjucksConfig(app);

  addTags(nunj, app);
  addMiddleware(app, config);

  if (_.isFunction(registerTags)) {
    registerTags(nunj, app);
  }

  app.engine('.html', consolidate.nunjucks);

  app.option('renameKey', renameKey);

  return (cb) => {

    const statsDir = addbase(buildDir);

    tools.development(isDev).server(statsDir).then(() => {
      let assets;
      try {
        const globalStats = readJsonSync(globalStatsPath);
        assets = _.merge({}, tools.assets(), _.omit(globalStats, 'assets'), {images: globalStats.assets});
      } catch (err) {
        assets = tools.assets();
      }

      app.data({assets});

      const parentConfig = callParent(arguments, {
        src,
        data: {
          app,
          assets,
          nunj
        }
      });

      const {
        src: newSrc,
        data,
        fn
      } = parentConfig;

      if (enableIsomorphic) {
        const {isomorphic} = config;
        const {context: cwd, entries: componentEntries} = isomorphic;

        /**
         * Create the isomorphic "snippets"
         */
        app.create('snippets', {viewType: 'partial', renameKey}).use(jsxLoader);

        app.task('template', (done) => {
          app.snippets.load(
            componentEntries,
            {cwd},
            config,
            (err) => {
              if (err) {
                logError({err, plugin: '[template-assemble]: error templating .jsx template'});
              }

              done(null);
            }
          );
        });
      }

      app.task('build', enableIsomorphic && !isDev ? ['template'] : [], () => {
        let stream = app.src(newSrc)
          .pipe(isoMerge(app, config))
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

      const task = (done) => {
        app.task('watch', ['build'], () => {
          const watchBase = data.watch || addbase(srcDir, '{templates,config}/**/*.{html,yml}');

          app.watch(watchBase, ['build']);
          done();
        });

        app.build(isDev ? ['watch'] : ['build'], (err) => {
          if (err) {
            logError({err, plugin: '[assemble]: run'});
          }
          done();
        });
      };

      runFn(task, fn, cb);
    }).catch((err) => {
      logError({err, plugin: '[assemble: server]'});
    });
  };
}
