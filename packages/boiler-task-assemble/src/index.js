import {join} from 'path';
import boilerUtils from 'boiler-utils';
import makeConfig from 'boiler-config-assemble';

export default function(gulp, plugins, config, {addons}) {
  const {browserSync} = plugins;
  const {
    buildLogger,
    renameKey,
    runParentFn: callParent,
    runCustomTask: runFn
  } = boilerUtils;
  const {log, blue} = buildLogger;
  const {
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

  return (cb) => {
    const {
      app,
      assets: prom,
      data: addonData = {}
    } = makeConfig(config);

    if (isDev) {
      const watch = require('base-watch');
      app.use(watch());
    }

    prom.then((assets) => {
      app.data({assets});

      const {
        nunjucks: nunj,
        isomorphic: isomorphicAddonData
      } = addonData;
      const {jsxLoader, plugin: isoMerge} = isomorphicAddonData;
      const parentConfig = callParent(arguments, {
        src,
        data: {
          app,
          assets,
          jsxLoader,
          nunj
        }
      });

      const {
        src: newSrc,
        data,
        fn
      } = parentConfig;

      const task = (done) => {
        if (enableIsomorphic) {
          /**
           * Create the isomorphic "snippets"
           */
          app.create('snippets', {viewType: 'partial', renameKey}).use(jsxLoader);

          app.task('template', (done) => {
            app.snippets.load(
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
