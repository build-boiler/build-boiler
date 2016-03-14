import isPlainObject from 'lodash/isPlainObject';
import {safeLoad} from 'js-yaml';
import {readFileSync} from 'fs';
import Plasma from 'plasma';

export default function(config) {
  const {sources, utils} = config;
  const {srcDir} = sources;
  const {addbase} = utils;
  const plasma = new Plasma();

  plasma.dataLoader('yml', function(fp) {
    const ymlStr = readFileSync(fp, 'utf8');

    return safeLoad(ymlStr);
  });


  return (file, next) => {
    try {
      const globalData = plasma.load(
        addbase(srcDir, 'config', '**/*.yml'),
        {namespace: () => 'global_data'}
      );

      if (isPlainObject(globalData)) {
        Object.assign(file.data, globalData);
      }

      next(null, file);
    } catch (err) {
      next(err);
    }
  };
}
