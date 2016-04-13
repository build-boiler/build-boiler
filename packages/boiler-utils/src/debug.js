import debug from 'debug';
import path from 'path';
import isUndefined from 'lodash/isUndefined';

export default function(filename) {
  if (isUndefined(filename)) {
    throw new Error('Must supply a filename to the debug function');
  }
  const [first, ...rest] = filename.split('dist');
  const debugName = path.join(
    path.basename(first),
    rest.join(path.sep)
  );

  const log = debug('boiler');
  log.log = console.log.bind(console, '\nDEBUG:');
  log(`LOADING ${debugName}`);

  return log;
}
