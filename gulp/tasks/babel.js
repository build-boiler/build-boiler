import path from 'path';
import through from 'through2';
import omit from 'lodash/omit';
import {readJsonSync} from 'fs-extra';

export default function(gulp, plugins, config) {
  const {
    babel,
    plumber,
    newer,
    gutil,
    gulpIf
  } = plugins;
  const {log, colors} = gutil;
  const {cyan} = colors;
  const {release} = config;
  const scripts = './packages/*/src/**/*.js';
  const dest = 'packages';
  let srcEx, libFragment;

  if (path.win32 === path) {
    srcEx = /(packages\\[^\\]+)\\src\\/;
    libFragment = '$1\\dist\\';
  } else {
    srcEx = new RegExp('(packages/[^/]+)/src/');
    libFragment = '$1/dist/';
  }

  return () => {
    return gulp.src(scripts)
      .pipe(plumber({
        errorHandler: function(err) {
          gutil.log(err.stack);
        }
      }))
      .pipe(through.obj(function(file, enc, cb) {
        file._path = file.path;
        file.path = file.path.replace(srcEx, libFragment);
        cb(null, file);
      }))
      .pipe(gulpIf(!release, newer(dest)))
      .pipe(through.obj(function(file, enc, cb) {
        log(`Compiling", '${cyan(file._path)}'`);
        cb(null, file);
      }))
      .pipe(babel({
        babelrc: false,
        comments: false,
        ...omit(
          readJsonSync(path.join(process.cwd(), '.babelrc')),
          'ignore'
        )
      }))
      .pipe(gulp.dest(dest));
  };
}
