import callParent from '../utils/run-parent-fn';
import runFn from '../utils/run-custom-task';

export default function(gulp, plugins, config) {
  const {del} = plugins;
  const {sources, utils} = config;
  const {buildDir} = sources;
  const {addbase} = utils;

  const src = [
    addbase(buildDir)
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
