import makeEslintConfig from 'eslint-config';
import formatter from 'eslint-friendly-formatter';
import callParent from '../../utils/run-parent-fn';
import runFn from '../../utils/run-custom-task';

export default function(gulp, plugins, config, parentMod) {
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
    const parentConfig = callParent(arguments, {
      src,
      data: pluginConfig
    });

    const {
      src: newSrc,
      data: eslintConfig,
      fn
    } = parentConfig;

    const task = () => {
      return gulp.src(newSrc)
        .pipe(eslint(eslintConfig))
        .pipe(eslint.format(formatter));
    };

    return runFn(task, fn);
  };
}
