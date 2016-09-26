export default function(gulp, plugins, config, opts) {
  const {utils} = config;
  const {addbase} = utils;
  return {
    data: {
      files: addbase('packages', '*', 'src', '**/*.js'),
      docs: addbase('docs'),
      format: 'html',
      github: true,
      shallow: false
    }
  }
}
