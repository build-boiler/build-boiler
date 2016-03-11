export default function(gulp, plugins, config, opts) {
  const {release, utils} = config;
  const {addbase} = utils;
  const {src} = opts;

  if (release) {
    src.push(
      addbase('packages/*/dist/**/*.js')
    );
  }

  return {
    src
  };
}
