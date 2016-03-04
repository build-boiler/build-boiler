import path from 'path';
import requireDir from '../../../utils/require-dir';

export default function(app, config) {
  const onloadFns = requireDir(
    path.join(__dirname, 'onload')
  );

  const prerenderFns = requireDir(
    path.join(__dirname, 'pre-render')
  );

  function callFns(fn, ...rest) {
    fn.length === 1 ? fn(config).apply(null, rest) : fn.apply(null, rest);
  }

  app.onLoad(/\.(?:md|html)$/, (file, next) => {
    onloadFns.forEach(fn => callFns(fn, file, next));
  });

  app.preRender(/\.(?:md|html)$/, (file, next) => {
    prerenderFns.forEach(fn => callFns(fn, file, next));
  });
}

