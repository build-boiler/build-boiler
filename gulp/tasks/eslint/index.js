import formatter from 'eslint-friendly-formatter';

export default function(gulp, plugins, config, opts) {
  const {eslint} = plugins;
  const {src, data} = opts;

  return gulp.src(src)
    .pipe(eslint(data))
    .pipe(eslint.format(formatter));
}
