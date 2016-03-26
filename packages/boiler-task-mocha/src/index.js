import path from 'path';
import isString from 'lodash/isString';
import boilerUtils from 'boiler-utils';

export default function(gulp, plugins, config) {
  const {mocha} = plugins;
  const {
    file,
    mocha: mochaParentConfig = {},
    sources,
    utils
  } = config;
  const {add, require: parentRequire} = mochaParentConfig;
  const {testDir} = sources;
  const {addbase} = utils;
  const {
    runParentFn: callParent,
    runCustomTask: runFn,
    transformArray
  } = boilerUtils;

  const src = [
    addbase(testDir, 'unit', `**/${file || '*-spec'}.js`)
  ];
  const baseRequire = [
    path.join(__dirname, 'hooks', 'babel.js')
  ];
  const data = {};

  if (parentRequire) {
    const parentReqArray = transformArray(parentRequire, isString);

    data.require = add ?
      [...baseRequire, ...parentReqArray] :
      parentReqArray;
  } else {
    data.require = baseRequire;
  }

  return () => {
    const parentConfig = callParent(arguments, {
      src,
      data
    });
    const {
      src: newSrc,
      data: mochaConfig,
      fn
    } = parentConfig;

    const task = () => {
      return gulp.src(newSrc)
        .pipe(mocha(mochaConfig));
    };

    return runFn(task, fn);
  };
}
