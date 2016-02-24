import _ from 'lodash';
import {readJsonSync} from 'fs-extra';
import Plasma from 'plasma';

export default function(app, config) {
  const {sources, utils} = config;
  const {
    srcDir,
    scriptDir
  } = sources;
  const {addbase} = utils;
  const plasma = new Plasma();

  plasma.dataLoader('json', (fp) => readJsonSync(fp));

  app.onLoad(/\.(?:md|html)$/, (file, next) => {
    const jsonData = plasma.load(
      addbase(srcDir, scriptDir, '**/*.json'), {namespace: true}
    );

    _.assign(file.data, jsonData);
    next(null, file);
  });
}

