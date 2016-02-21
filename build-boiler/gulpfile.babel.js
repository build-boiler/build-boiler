import 'babel-polyfill';
import {omit} from 'lodash';
import path from 'path';
import {readJsonSync} from 'fs-extra';
import gulp from 'gulp';
import babel from 'gulp-babel';
import del from 'del';
import sequence from 'run-sequence';

const babelConfigPath = path.resolve(__dirname, '.babelrc');
const babelConfig = readJsonSync(babelConfigPath);

babelConfig.babelrc = false;

gulp.task('babel', (cb) => {
  const src = [
    './**/gulp/**/*.js',
    './index.js',
    '!./node_modules/**/*',
    '!./dist/**/*'
  ];

  const wrapProm = (src, config) => {
    return new Promise((res) => {
      gulp.src(src)
        .pipe(babel(config))
        .pipe(gulp.dest('dist'))
        .on('end', res);
    });
  };

  const tasks = [
    wrapProm(src, babelConfig),
    wrapProm('./post-install.js', omit(babelConfig, 'plugins'))
  ];

  Promise.all(tasks).then(() => cb()).catch((err) => cb());
});

gulp.task('copy', () => {
  const src = [
    './global-*.js',
    './publish.sh',
    './*.{md,json}',
    './.*'
  ];

  const wrapProm = (src, dest = 'dist') => {
    return new Promise((res) => {

      gulp.src(src)
        .pipe(gulp.dest(dest))
        .on('end', res);
    });
  };

  const tasks = [
    wrapProm(src),
    wrapProm('test-config/**/*', 'dist/test-config')
  ];

  Promise.all(tasks).then(() => cb()).catch((err) => cb());
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
