export default function(gulp, plugins, config) {
  const {sources, utils} = config;
  const {buildDir, srcDir} = sources;
  const {rename} = plugins;
  const {addbase} = utils;

  const src = [
    addbase(srcDir, 'img/favicon.ico')
  ];

  return () => {
    return gulp.src(src, {base: srcDir})
      .pipe(rename((fp) => {
        const {basename} = fp;

        if (basename === 'favicon') {
          fp.dirname = '';
        }
      }))
      .pipe(gulp.dest(buildDir));
  };
}

