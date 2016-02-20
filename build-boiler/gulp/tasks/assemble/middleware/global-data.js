import {assign} from 'lodash';
import {safeLoad} from 'js-yaml';
import {readFileSync} from 'fs';
import Plasma from 'plasma';

export default function(app, config) {
  const {sources, utils} = config;
  const {srcDir} = sources;
  const {addbase} = utils;
  const plasma = new Plasma();

  plasma.dataLoader('yml', function(fp) {
    const ymlStr = readFileSync(fp, 'utf8');

    return safeLoad(ymlStr);
  });


  app.preRender(/\.(?:md|html)$/, (file, next) => {
    const globalData = plasma.load(
      addbase(srcDir, 'config', '**/*.yml'),
      {namespace: () => 'global_data'}
    );

    assign(file.data, globalData);
    next(null, file);
  });
}
