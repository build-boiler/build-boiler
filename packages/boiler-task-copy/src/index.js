import boilerUtils from 'boiler-utils';

export default function(gulp, plugins, config) {
  const {sources, utils} = config;
  const {buildDir, srcDir} = sources;
  const {rename} = plugins;
  const {addbase} = utils;
  const {
    runParentFn: callParent,
    runCustomTask: runFn
  } = boilerUtils;

  const src = [
    addbase(srcDir, 'img/favicon.ico')
  ];

  return () => {
    const parentConfig = callParent(arguments, {src});
    const {
      src: newSrc,
      fn
    } = parentConfig;

    const task = () => {
      return gulp.src(newSrc, {base: srcDir})
        .pipe(rename((fp) => {
          const {basename} = fp;

          if (basename === 'favicon') {
            fp.dirname = '';
          }
        }))
        .pipe(gulp.dest(buildDir));
    };

    return runFn(task, fn);
  };
}
