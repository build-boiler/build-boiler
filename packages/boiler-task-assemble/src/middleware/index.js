import _ from 'lodash';
import path from 'path';
import boilerUtils from 'boiler-utils';

export default function(app, config, {preRender = [], onload = []}) {
  const {
    requireDir,
    transformArray: createArray
  } = boilerUtils;
  const onloadFns = requireDir(
    path.join(__dirname, 'onload')
  );

  const preRenderFns = requireDir(
    path.join(__dirname, 'pre-render')
  );

  onload = createArray(onload, _.isFunction);
  preRender = createArray(preRender, _.isFunction);

  onloadFns.push(...onload);
  preRenderFns.push(...preRender);

  function callFns(fn, ...rest) {
    fn.length === 1 ? fn(config).apply(null, rest) : fn.apply(null, rest);
  }

  app.onLoad(/\.(?:md|html)$/, (file, next) => {
    onloadFns.forEach(fn => callFns(fn, file, next));
    next(null, file);
  });

  app.preRender(/\.(?:md|html)$/, (file, next) => {
    preRenderFns.forEach(fn => callFns(fn, file, next));
    next(null, file);
  });
}

