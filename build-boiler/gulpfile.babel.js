import 'babel-polyfill';
import path from 'path';
import {readJsonSync} from 'fs-extra';
import gulp from 'gulp';
import babel from 'gulp-babel';
import del from 'del';
import sequence from 'run-sequence';

const babelConfigPath = path.resolve(__dirname, '.babelrc');
const babelConfig = readJsonSync(babelConfigPath);

babelConfig.babelrc = false;

gulp.task('babel', () => {
  const src = [
    './**/gulp/**/*.js',
    './post-install.js',
    './index.js',
    '!./node_modules/**/*',
    '!./dist/**/*'
  ];

  return gulp.src(src)
    .pipe(babel(babelConfig))
    .pipe(gulp.dest('dist'));
});

gulp.task('copy', () => {
  const src = [
    './global-*.js',
    './publish.sh',
    './*.{md,json}',
    './.*',
    './**/test-config/**/*.js'
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
    './{index,post-install}.js',
    '!./node_modules/**/*',
    '!./dist/**/*',
    './global-*.js',
    './*.{md,json}',
    './.*'
  ];

  gulp.watch(allSrc, ['copy', 'babel']);
});
