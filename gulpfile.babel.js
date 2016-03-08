import 'babel-polyfill';
import gulp from 'gulp';
import build from './packages/boiler-core/src';

const {tasks, plugins} = build(gulp);
const {sequence} = plugins;
const scripts = './packages/*/src/**/*.js';

gulp.task('babel', tasks.babel);
gulp.task('lint:test', tasks.eslint);
gulp.task('lint:build', tasks.eslint);
gulp.task('lint', ['lint:test', 'lint:build']);

gulp.task('default', ['lint', 'babel']);

gulp.task('watch', ['default'], () => {
  gulp.watch(scripts, (cb) => {
    sequence(
      'lint',
      'babel',
      cb
    );
  });
});
