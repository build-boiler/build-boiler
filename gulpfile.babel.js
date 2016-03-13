import 'babel-polyfill';
import path from 'path';
import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import formatter from 'eslint-friendly-formatter';
import makeEslintConfig from 'eslint-config';

const scripts = './packages/*/src/**/*.js';

if (process.argv.indexOf('--force') !== -1) {
  let tasks = {};
  let plugins;

  try {
    const build = require('./packages/boiler-core/src');

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
  const copyFn = require(
    path.join(process.cwd(), 'gulp', 'tasks', 'copy')
  );

  const {eslint, sequence} = plugins;
  const eslintConfig = makeEslintConfig({
    basic: false,
    react: true,
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
  gulp.task('copy', tasks.copy || copyFn(gulp, plugins, {}));

  gulp.task('watch', ['lint', 'babel', 'copy'], () => {
    gulp.watch(scripts, [], (cb) => {
      sequence(
        'lint',
        ['babel'],
        cb
      );
    });

    gulp.watch('./packages/*/src/**/*.json', ['copy']);
  });
} else {
  const build = require('./packages/boiler-core/src');
  const {tasks, config, plugins: $} = build(gulp);
  const {sources, utils, environment, release} = config;
  const {isDev} = environment;
  const {testDir, buildDir} = sources;
  const {addbase} = utils;

  gulp.task('assemble', tasks.assemble);
  gulp.task('babel', tasks.babel);
  gulp.task('browser-sync', tasks.browserSync);
  gulp.task('clean', tasks.clean);
  gulp.task('copy', tasks.copy);
  gulp.task('karma', tasks.karma);
  gulp.task('lint:test', tasks.eslint);
  gulp.task('lint:build', tasks.eslint);
  gulp.task('lint', ['lint:test', 'lint:build']);
  gulp.task('selenium', tasks.selenium);
  gulp.task('selenium:tunnel', tasks.selenium);
  gulp.task('webpack:global', tasks.webpack);
  gulp.task('webpack:main', tasks.webpack);
  gulp.task('webpack', ['webpack:global', 'webpack:main']);

  gulp.task('build', (cb) => {
    if (isDev) {
      //gulp watch
      $.sequence(
        'clean',
        'copy',
        'lint',
        'webpack',
        'assemble',
        'browser-sync',
        cb
      );
    } else if (release) {
      $.sequence(
        'clean',
        'copy',
        'lint',
        'babel',
        cb
      );
    } else {
      $.sequence(
        'clean',
        'copy',
        'lint',
        'webpack',
        'assemble',
        cb
      );
    }
  });

  gulp.task('default', ['build']);


  gulp.task('test:integration', (cb) => {
    $.sequence(
      ['clean', 'lint'],
      'karma',
      cb
    );

    gulp.watch([
      addbase(testDir, '**/*.js')
    ], ['lint:test']);
  });

  gulp.task('watch', ['build'], () => {
    gulp.watch(addbase(buildDir, '{js,css}/**/*.{js,css}'), $.browserSync.reload);
    gulp.watch([
      addbase(testDir, '**/*.js'),
      addbase(buildDir, '**/*.js')
    ], ['lint']);
  });
}
