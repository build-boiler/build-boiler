import path from 'path';
import {sync as syncGlob} from 'globby';
import boilerUtils from 'boiler-utils';

export default function(config, opts = {}) {
  const {renameKey} = boilerUtils;
  const {cwd, glob} = opts;
  const {sources} = config;
  const {templateDir} = sources;
  const templateGlob = glob || path.join(templateDir, 'pages', '**', '*.{js, jsx}');
  const jsFiles = syncGlob(templateGlob, {cwd});

  return jsFiles.reduce((acc, fp) => ({
    ...acc,
    [renameKey(fp, 'main')]: [`./${fp}`]
  }), {});
}
