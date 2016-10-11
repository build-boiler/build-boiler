import makeEslintConfig from 'boiler-config-eslint';
import formatter from 'eslint-friendly-formatter';
import boilerUtils from 'boiler-utils';

export default function(gulp, plugins, config, parentMod) {
  const {
    runParentFn: callParent,
    runCustomTask: runFn
  } = boilerUtils;
  const {eslint, gulpIf} = plugins;
  const {
    utils,
    environment,
    eslint: eslintParentConfig,
    metaData
  } = config;
  const {isDev} = environment;
  const {addbase, addroot, getTaskName} = utils;
  let src;

  return () => {
    const lintEnv = getTaskName(metaData);

    if (lintEnv === 'test') {
      src = [addbase('test', '**/*.js')];
    } else if (lintEnv === 'build') {
      src = [
        addbase('gulp', '{config,tasks}', '**/*.js'),
        addroot('gulp', '**/*.js'),
        addbase('gulpfile.babel.js')
      ];
    }
    const defaultConfig = {
      basic: true,
      react: false,
      isDev,
      lintEnv
    };

    const pluginConfig = makeEslintConfig(
      Object.assign({}, defaultConfig, eslintParentConfig)
    );
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
        .pipe(eslint.format(formatter))
        .pipe(gulpIf(!isDev, eslint.failAfterError()));
    };

    return runFn(task, fn);
  };
}
