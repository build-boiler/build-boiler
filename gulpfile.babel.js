import 'babel-polyfill';
import path from 'path';
import gulp from 'gulp';
import build from './packages/boiler-core/src';
import loadPlugins from 'gulp-load-plugins';
import formatter from 'eslint-friendly-formatter';
import makeEslintConfig from 'eslint-config';

const scripts = './packages/*/src/**/*.js';

if (process.argv.indexOf('--force') !== -1) {
  let tasks = {};
  let plugins;

  try {
    ({tasks, plugins} = build(gulp));
  } catch (err) {
    plugins = loadPlugins({
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
    });
  }

  const babelFn = require(
    path.join(process.cwd(), 'gulp', 'tasks', 'babel')
  );

  const {eslint, sequence} = plugins;
  const eslintConfig = makeEslintConfig({
    basic: false,
    react: false,
    isDev: true,
    lintEnv: 'build'
  });
  const eslintFn = () => {
    return gulp.src(scripts)
      .pipe(eslint(eslintConfig))
      .pipe(eslint.format(formatter));
  };

  gulp.task('babel', tasks.babel || babelFn(gulp, plugins, {}));
  gulp.task('lint', tasks.lint || eslintFn);

  gulp.task('watch', ['lint', 'babel'], () => {
    gulp.watch(scripts, [], (cb) => {
      sequence(
        'lint',
        'babel',
        cb
      );
    });
  });
} else {
  const {tasks, plugins} = build(gulp);
  const {sequence} = plugins;

  gulp.task('babel', tasks.babel);
  gulp.task('copy', tasks.copy);
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
}
