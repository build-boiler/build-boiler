import 'babel-polyfill';
import gulp from 'gulp';
import babel from 'gulp-babel';
import del from 'del';
import rename from 'rename';
import sequence from 'run-sequence';

gulp.task('babel', () => {
  const src = [
    './**/gulp/**/*.js',
    './index.js',
    '!node_modules/**/*',
    '!dist/**/*'
  ];

  return gulp.src(src)
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('copy', () => {
  const src = [
    './global.js',
    './*.{md,json}',
    './.*'
  ];

  return gulp.src(src)
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', () => del('dist'));

gulp.task('default', (cb) => {
  sequence(
    'clean',
    ['copy', 'babel'],
    cb
  );
});

gulp.task('watch', ['default'], () => {
  const allSrc = [
    './**/gulp/**/*.js',
    './index.js',
    '!node_modules/**/*',
    '!dist/**/*',
    './global-*.js',
    './*.{md,json}',
    './.*'
  ];

  gulp.watch(allSrc, ['copy', 'babel']);
});
