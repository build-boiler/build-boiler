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
  const {gulpIf, babel, newer} = plugins;
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

  return () => {
    const taskName = getTaskName(gulp.currentTask);
    const isDevTask = taskName === 'dev';
    const baseConfig = {
      babelrc: taskRc,
      dev: isDev || isDevTask,
      endpoints: [{
        src: ['lib/**/*.js'],
        dest: addbase(buildDir)
      }]
    };

    const callConfigFn = initParentFn(config);
    /**
     * Get config from `gulp/config/index.js
     */
    const babelConfig = callConfigFn(parentConfig, baseConfig);

    /**
     * Call the parent gulp task if one exists
     */
    const {
      data,
      fn
    } = callParent(arguments, {data: babelConfig});
    const {
      babelrc,
      dev,
      endpoints
    } = data || babelConfig;

    function makeTask(src, dest) {
      return gulp.src(src)
        .pipe(gulpIf(dev, newer(dest)))
        .on('data', (file) => {
          log(`Babel Compiling", '${cyan(renameKey(file.path))}' to ${blue(renameKey(dest))}`);
        })
        .pipe(
          babel(babelrc)
        )
        .pipe(gulp.dest(dest));
    }

    const task = () => {
      const tasks = transformArray(endpoints, isPlainObject).map(data => {
        const {src, dest} = data;

        return makeTask(src, dest);
      });

      return es.merge(tasks);
    };

    return runFn(task, fn);
  };
}
