export default function(gulp, plugins, config) {
  const {del} = plugins;
  const {sources, utils} = config;
  const {buildDir} = sources;
  const {addbase} = utils;

  const src = [
    addbase(buildDir)
  ];

  return () => {
    return del(src);
  };
}

