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
  } else if (taskName === 'test') {
    data.rules['no-console'] = 0;
  }

  return {
    src,
    data
  };
}
