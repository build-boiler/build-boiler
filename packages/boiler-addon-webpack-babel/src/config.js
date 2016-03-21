export default function(config, data) {
  const {isMainTask, sources, webpackConfig} = config;
  const {mainBundleName} = sources;
  const {
    babel: babelParentConfig = {},
    multipleBundles
  } = webpackConfig;
  const {omitPolyfill} = babelParentConfig;
  const {entry} = data;

  function addPollyfill(bundle) {
    const add = !omitPolyfill && bundle.indexOf('babel-polyfill') === -1;

    return add ? ['babel-polyfill', ...bundle] : bundle;
  }

  if (isMainTask) {
    const {vendors} = entry;
    const main = entry[mainBundleName];
    const hasVendors = Array.isArray(!!multipleBundles && vendors);
    const hasMain = Array.isArray(main);


    if (hasVendors) {
      entry.vendors = addPollyfill(vendors);
    } else if (hasMain) {
      entry[mainBundleName] = addPollyfill(main);
    }
  }

  return data;
}
