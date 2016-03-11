export default function(gulp, plugins, config, opts) {
  const {utils} = config;
  const {addbase, getTaskName} = utils;
  const {src, data} = opts;
  const taskName = getTaskName(gulp.currentTask);

  if (taskName === 'build') {
    src.push(...[
      addbase('packages/*/src/**/*.js')
    ]);
  }

  return {
    src,
    data
  };
}
