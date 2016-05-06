import boilerUtils from 'boiler-utils';
import isPlainObject from 'lodash/isPlainObject';
import es from 'event-stream';
import {babelrc as taskRc} from './config';

export default function(gulp, plugins, config) {
  const {
    buildLogger,
    callAndReturn: initParentFn,
    runParentFn: callParent,
    runCustomTask: runFn,
    renameKey,
    transformArray
  } = boilerUtils;
  const {gulpIf, babel, newer, sourcemaps} = plugins;
  const {log, colors, blue} = buildLogger;
  const {cyan} = colors;
  const {
    babel: parentConfig,
    sources,
    environment,
    utils
  } = config;
  const {buildDir} = sources;
  const {isDev} = environment;
  const {addbase, getTaskName} = utils;
  const src = [
    addbase('lib', '**/*.js')
  ];
  const dest = addbase(buildDir);

  return () => {
    const taskName = getTaskName(gulp.currentTask);
    const isDevTask = taskName === 'dev';
    const baseConfig = {
      src,
      babelrc: taskRc,
      dev: isDev || isDevTask,
      endpoints: [{
        src,
        dest
      }]
    };

    const callConfigFn = initParentFn(config);
    /**
     * Get config from `gulp/config/index.js
     */
    const {src: updatedSrc, ...babelConfig} = callConfigFn(parentConfig, baseConfig);

    /**
     * Call the parent gulp task if one exists
     */
    const {
      src: newSrc,
      data,
      fn
    } = callParent(arguments, {
      src: updatedSrc,
      data: babelConfig
    });
    const {
      babelrc,
      dev,
      endpoints,
      sourcemaps: enableSourcemaps
    } = data || babelConfig;

    function makeTask(src, dest) {
      return gulp.src(src)
        .pipe(gulpIf(dev, newer(dest)))
        .on('data', (file) => {
          log(`Babel Compiling", '${cyan(renameKey(file.path))}' to ${blue(renameKey(dest))}`);
        })
        .pipe(gulpIf(enableSourcemaps, sourcemaps.init()))
        .pipe(
          babel(babelrc)
        )
        .pipe(gulpIf(enableSourcemaps, sourcemaps.write('.')))
        .pipe(gulp.dest(dest));
    }

    const task = () => {
      let tasks;

      if (newSrc && updatedSrc !== newSrc) {
        tasks = makeTask(newSrc, dest);
      } else {
        tasks = transformArray(endpoints, isPlainObject).map(data => {
          const {src, dest} = data;

          return makeTask(src, dest);
        });
      }

      return es.merge(tasks);
    };

    return runFn(task, fn);
  };
}
