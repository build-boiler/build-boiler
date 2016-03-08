import 'babel-polyfill';
import path from 'path';
import gulp from 'gulp';
import load from 'gulp-load-plugins';
import through from 'through2';
import {readJsonSync} from 'fs-extra';
import build from './packages/boiler-core/src';

const {tasks} = build(gulp);

const loadConfig = {
  lazy: false,
  pattern: [
    'gulp-*',
    'gulp.*',
    'del',
    'run-sequence',
    'browser-sync'
  ],
  rename: {
    'gulp-util': 'gutil',
    'run-sequence': 'sequence',
    'gulp-if': 'gulpIf'
  }
};

const {
  babel,
  del,
  plumber,
  newer,
  sequence,
  gutil
} = load(loadConfig);

const {log, colors} = gutil;
const {cyan} = colors;

const babelConfigPath = path.resolve(__dirname, '.babelrc');
const scripts = './packages/*/src/**/*.js';
const dest = 'packages';

let srcEx, libFragment;

if (path.win32 === path) {
  srcEx = /(packages\\[^\\]+)\\src\\/;
  libFragment = "$1\\dist\\";
} else {
  srcEx = new RegExp("(packages/[^/]+)/src/");
  libFragment = "$1/dist/";
}

gulp.task('babel', (cb) => {
  const babelConfig = readJsonSync(babelConfigPath);

  return gulp.src(scripts)
    .pipe(plumber({
      errorHandler: function (err) {
        gutil.log(err.stack);
      }
    }))
    .pipe(through.obj(function (file, enc, cb) {
      file._path = file.path;
      file.path = file.path.replace(srcEx, libFragment);
      cb(null, file);
    }))
    .pipe(newer(dest))
    .pipe(through.obj(function (file, enc, cb) {
      gutil.log(`Compiling", '${cyan(file._path)}'`);
      cb(null, file);
    }))
    .pipe(babel({
      babelrc: false,
      ...babelConfig
    }))
    .pipe(gulp.dest(dest));
});

gulp.task('clean', () => del(
  path.join(
    dest,
    '*',
    'dist'
  )
));

gulp.task('default', (cb) => {
  sequence(
    'clean',
    'babel',
    cb
  );
});

gulp.task('watch', ['default'], () => {
  gulp.watch(scripts, ['babel']);
});
