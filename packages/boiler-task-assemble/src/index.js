import {join} from 'path';
import boilerUtils from 'boiler-utils';
import jsxLoader from './jsx-loader';
import isoMerge from './isomorphic-merge-plugin';
import setup from './app-setup';
import getAssetStats from './parse-assets';

export default function(gulp, plugins, config, {addons}) {
  const {browserSync} = plugins;
  const {
    buildLogger,
    renameKey,
    runAddons,
    runParentFn: callParent,
    runCustomTask: runFn
  } = boilerUtils;
  const {log, blue} = buildLogger;
  const {
    assemble: assembleParentConfig,
    sources,
    utils,
    environment
  } = config;
  const {
    srcDir,
    buildDir,
    templateDir
  } = sources;
  const {addbase, logError} = utils;
  const {isDev, enableIsomorphic} = environment;
  const templatePath = addbase(srcDir, templateDir);
  const src = join(templatePath, 'pages/**/*.html');
  const {
    data: parentData,
    registerTags,
    middleware: parentMiddlware = {}
  } = assembleParentConfig;

  const app = setup(config, {
    data: parentData,
    templatePath
  });

  if (isDev) {
    const watch = require('base-watch');
    app.use(watch());
  }

  //TODO: handle config
  runAddons(addons, app, {
    config,
    fn: {
      nunjucks: registerTags,
      middleware: parentMiddlware
    },
    isomorphic: enableIsomorphic
  });

  return (cb) => {
    const prom = getAssetStats(config, {
      isomorphic: enableIsomorphic
    });

    prom.then((assets) => {
      app.data({assets});

      const parentConfig = callParent(arguments, {
        src,
        data: {
          app,
          assets,
          jsxLoader
        }
      });

      const {
        src: newSrc,
        data,
        fn
      } = parentConfig;

      const task = (done) => {
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

          if (browserSync && isDev) {
            stream = stream.pipe(browserSync.stream());
          }

          return stream;
        });

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
