import 'babel-polyfill';
import gulp from 'gulp';
import build from './build-boiler/index.js';
import sequence from 'run-sequence';

const {tasks, config, plugins: $} = build(gulp);
const {sources, utils, environment} = config;
const {isDev} = environment;
const {testDir, buildDir} = sources;
const {addbase} = utils;

gulp.task('assemble', tasks.assemble);
gulp.task('browser-sync', tasks.browserSync);
gulp.task('clean', tasks.clean);
gulp.task('copy', tasks.copy);
gulp.task('custom', tasks.custom);
gulp.task('karma', tasks.karma);
gulp.task('lint:test', tasks.eslint);
gulp.task('lint:build', tasks.eslint);
gulp.task('lint', ['lint:test', 'lint:build']);
gulp.task('webpack:global', tasks.webpack);
gulp.task('webpack:main', tasks.webpack);
gulp.task('webpack', ['webpack:global', 'webpack:main']);

gulp.task('build', (cb) => {
  if (isDev) {
    //gulp watch
    sequence(
      ['clean', 'custom'],
      ['copy', 'lint'],
      'webpack',
      'assemble',
      'browser-sync',
      cb
    );
  } else {
    sequence(
      'clean',
      ['copy', 'lint'],
      'webpack',
      'assemble',
      cb
    );
  }
});

gulp.task('default', ['build']);

gulp.task('watch', ['build'], () => {
  gulp.watch(addbase(buildDir, '{js,css}/**/*.{js,css}'), $.browserSync.reload);
  gulp.watch([
    addbase(testDir, '**/*.js'),
    addbase(buildDir, '**/*.js')
  ], ['lint']);
});
