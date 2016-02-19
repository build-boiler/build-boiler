import makeEslintConfig from 'eslint-config';
import formatter from 'eslint-friendly-formatter';

export default function(gulp, plugins, config) {
  const {eslint} = plugins;
  const {utils, environment} = config;
  const {isDev} = environment;
  const {addbase, addroot, getTaskName} = utils;
  let src;

  return () => {
    const lintEnv = getTaskName(gulp.currentTask);

    if (lintEnv === 'test') {
      src = [addbase('test', '**/*.js')];
    } else if (lintEnv === 'build') {
      src = [
        addbase('gulp', '{config,tasks}', '**/*.js'),
        addroot('gulp', '**/*.js'),
        addroot('index.js'),
        addbase('gulpfile.babel.js'),
        '!' + addroot('dist', '**/*')
      ];
    }

    const pluginConfig = makeEslintConfig({isDev, lintEnv});

    return gulp.src(src)
      .pipe(eslint(pluginConfig))
      .pipe(eslint.format(formatter));
  };
}
