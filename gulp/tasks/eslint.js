export default function(gulp, plugins, config, opts) {
  const {utils, metaData} = config;
  const {addbase, getTaskName} = utils;
  const {src, data} = opts;
  const taskName = getTaskName(metaData);

  if (taskName === 'build') {
    src.push(...[
      addbase('packages/*/src/**/*.js'),
      addbase('scripts/**/*.js')
    ]);
  }

  return {
    src,
    data
  };
}
