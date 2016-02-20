import requireDir from '../../../utils/require-dir';

export default function(app, config) {
  const middelwareFns = requireDir(__dirname, {
    ignore: 'index'
  });

  return middelwareFns.forEach(fn => fn(app, config));
}
