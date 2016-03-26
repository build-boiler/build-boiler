export default function(gulp, plugins, config, opts) {
  const {src} = opts;
  const {file, utils} = config;
  const {addbase} = utils;
  const pkgSrc = addbase('packages', '*', 'test', `**/${file || '*-spec'}.js`);

  src.push(pkgSrc);

  return {src};
}
