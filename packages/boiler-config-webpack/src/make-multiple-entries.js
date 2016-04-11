import path from 'path';
import {sync as syncGlob} from 'globby';
import boilerUtils from 'boiler-utils';

export default function(config, opts = {}) {
  const {renameKey} = boilerUtils;
  const {cwd, glob, preserve} = opts;
  const {sources} = config;
  const {templateDir} = sources;
  const templateGlob = glob || path.join(templateDir, 'pages', '**', '*.{js, jsx}');
  const jsFiles = syncGlob(templateGlob, {cwd});

  return jsFiles.reduce((acc, fp) => {
    const name = renameKey(fp, 'main');

    return {
      ...acc,
      [acc[name] || preserve ? renameKey(fp) : name]: [`./${fp}`]
    };
  }, {});
}
