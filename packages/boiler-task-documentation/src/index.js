// Libraries
import documentation from 'gulp-documentation';
import reduce from 'lodash/reduce';
// Packages
import boilerUtils from 'boiler-utils';


console.log(documentation);
/**
 * Generate documentation for a given project
 *
 * @param {Object} gulp // The gulp instance
 * @param {Object} plugins // Task plugins
 * @param {Object} config // The config
 * @return {stream.Transform}
 */
export default function(gulp, plugins, config) {
  const {
    runParentFn: callParent,
    runCustomTask: runFn,
    buildLogger
  } = boilerUtils;
  const {log} = buildLogger;
  const {utils} = config;
  const {addbase, logError} = utils;

  return (gulpCb) => {
    function exit(code) {
      if (typeof gulpCb === 'function') {
        gulpCb();
      }

      process.exit(code);
    }

    const defaultConfig = {
      files: addbase('src', '**/*.js'),
      docs: addbase('docs'),
      format: 'html',
      github: true,
      shallow: false
    };

    const parentConfig = callParent(arguments, defaultConfig);

    const {data: documentationConfig, fn} = parentConfig;

    const {files, docs, format} = documentationConfig;

    log(`Generating docs from ${files} to ${docs} in ${format} format`);

    return gulp.src(files)
               .pipe(documentation({format})).on('error', logError)
               .pipe(gulp.dest(docs));
  };
}
