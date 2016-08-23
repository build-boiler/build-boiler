import 'babel-polyfill';
import path from 'path';
import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import formatter from 'eslint-friendly-formatter';
import makeEslintConfig from 'eslint-config';

const scripts = './packages/*/src/**/*.js';
const tests = [
  './packages/*/test/**/*.js',
  './test/**/*.js'
];
const release = process.argv.indexOf('--release') !== -1;
const force = process.argv.indexOf('--force') !== -1;

if (force || release) {
  let tasks = {};
  let plugins;

  try {
    const build = require('./packages/boiler-core');

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

  const {eslint} = plugins;
  const eslintFn = (lintEnv) => {
    const eslintConfig = makeEslintConfig({
      basic: false,
      react: true,
      isDev: true,
      lintEnv
    });

    return () => {
      return gulp.src(scripts)
        .pipe(eslint(eslintConfig))
        .pipe(eslint.format(formatter));
    };
  };
  const config = {force, release};

  gulp.task('babel', tasks.babel || babelFn(gulp, plugins, config));
  gulp.task('lint:build', tasks.lint || eslintFn('build'));
  gulp.task('lint:test', tasks.lint || eslintFn('test'));
  gulp.task('lint', gulp.parallel('lint:test', 'lint:build'));
  gulp.task('copy', tasks.copy || copyFn(gulp, plugins, config));
  gulp.task('build', gulp.series(
    'lint',
    gulp.parallel('copy', 'babel')
  ));
  gulp.task('run-watch', () => {
    gulp.watch(scripts).on('change', gulp.series('lint:build', 'babel'));
    gulp.watch(tests).on('change', gulp.series('lint:test'));
    gulp.watch('./packages/*/src/**/*.json').on('change', gulp.series('copy'));
  });

  gulp.task('watch', gulp.series(
    'lint',
    gulp.parallel('babel', 'copy'),
    'run-watch'
    )
  );
} else {
  const build = require('./packages/boiler-core');
  const {tasks, config, plugins: $} = build(gulp, {
    //fp: 'boiler.custom.config.js'
  });
  const {sources, utils, environment, release} = config;
  const {isDev, branch} = environment;
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
  gulp.task('lint', gulp.parallel('lint:test', 'lint:build'));
  gulp.task('mocha', tasks.mocha);
  gulp.task('nodemon', tasks.nodemon);
  gulp.task('selenium', tasks.selenium);
  gulp.task('selenium:tunnel', tasks.selenium);
  gulp.task('webpack:global', tasks.webpack);
  gulp.task('webpack:main', tasks.webpack);
  gulp.task('webpack:server', tasks.webpack);
  gulp.task('webpack', gulp.series('webpack:global', 'webpack:main'));

  let task;

  if (isDev) {
    //gulp watch
    task = gulp.series(
      'clean',
      'copy',
      'lint',
      'webpack',
      'assemble',
      'browser-sync'
    );
  } else if (release) {
    task = gulp.series(
      'clean',
      'copy',
      'lint',
      'babel'
    );
  } else if (branch) {
    task = gulp.series(
      'copy',
      'lint',
      'babel',
      'webpack',
      'webpack:server',
      'assemble'
    );
  } else {
    task = gulp.series(
      'clean',
      'copy',
      'lint',
      'webpack',
      'webpack:server',
      'assemble'
    );
  }

  gulp.task('build', task);
  gulp.task('default', gulp.series('build'));

  gulp.task('test:integration', gulp.series(
    gulp.parallel('clean', 'lint'),
    'karma',
    () => {
      gulp.watch(
        addbase(testDir, '**/*.js')
      ).on('change', gulp.series('lint:test'));
    })
  );
  gulp.task('run-watch', () => {
    gulp.watch(
      addbase(buildDir, '{js,css}/**/*.{js,css}')
    ).on('change', $.browserSync.reload);

    gulp.watch([
      addbase(testDir, '**/*.js'),
      addbase(buildDir, '**/*.js')
    ]).on('change', gulp.series('lint'));
  });

  gulp.task('watch', gulp.series('build', 'run-watch'));
}
