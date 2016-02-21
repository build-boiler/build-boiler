import path from 'path';
import through from 'through2';

export default function(gulp, plugins, config, opts) {
  const scripts = './packages/*/src/**/*.json';
  const dest = 'packages';
  let srcEx, libFragment;

  if (path.win32 === path) {
    srcEx = /(packages\\[^\\]+)\\src\\/;
    libFragment = '$1\\dist\\';
  } else {
    srcEx = new RegExp('(packages/[^/]+)/src/');
    libFragment = '$1/dist/';
  }

  return (cb) => {
    return gulp.src(scripts)
      .pipe(through.obj(function(file, enc, cb) {
        file._path = file.path;
        file.path = file.path.replace(srcEx, libFragment);
        cb(null, file);
      }))
      .pipe(gulp.dest(dest));
  };
}
