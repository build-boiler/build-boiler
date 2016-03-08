export default function(gulp, plugins, config, opts) {
  const {utils} = config;
  const {addbase} = utils;
  const {src, data} = opts;

  src.push(...[
    addbase('packages/*/src/**/*.js')
  ]);

  return {
    src,
    data
  };
}
