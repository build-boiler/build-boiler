import boilerUtils from 'boiler-utils';

export default function(gulp, plugins, config) {
  const {
    runParentFn: callParent,
    runCustomTask: runFn
  } = boilerUtils;
  const {del} = plugins;
  const {sources, utils} = config;
  const {buildDir} = sources;
  const {addbase} = utils;

  const src = [
    addbase(buildDir),
    addbase('coverage')
  ];

  return () => {
    const parentConfig = callParent(arguments, {src});
    const {
      src: newSrc,
      fn
    } = parentConfig;

    const task = () => {
      return del(newSrc);
    };

    return runFn(task, fn);
  };
}
