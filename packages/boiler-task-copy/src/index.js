import boilerUtils from 'boiler-utils';
import isPlainObject from 'lodash/isPlainObject';
import es from 'event-stream';

export default function(gulp, plugins, config) {
  const {
    callAndReturn: initParentFn,
    runParentFn: callParent,
    runCustomTask: runFn,
    transformArray
  } = boilerUtils;
  const {
    copy: parentConfig,
    sources,
    utils
  } = config;
  const {buildDir, srcDir} = sources;
  const {addbase} = utils;
  const src = [
    addbase(srcDir, 'img/favicon.ico')
  ];
  const dest = addbase(buildDir);

  return () => {
    const baseConfig = {
      src,
      endpoints: [{
        src,
        dest
      }]
    };

    const callConfigFn = initParentFn(config);
    /**
     * Get config from `gulp/config/index.js
     */
    const copyConfig = callConfigFn(parentConfig, baseConfig);

    /**
     * Call the parent gulp task if one exists
     */
    const {
      src: newSrc,
      data,
      fn
    } = callParent(arguments, {src, data: copyConfig});
    const {endpoints} = data || copyConfig;

    function makeTask(src, dest) {
      return gulp.src(src)
        .pipe(gulp.dest(dest));
    }

    const task = () => {
      let tasks;

      if (newSrc && src !== newSrc) {
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
