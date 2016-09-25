// Packages
import boilerUtils from 'boiler-utils';


/**
 * Generate documentation for a given project
 *
 * @param {Object} gulp // The gulp instance
 * @param {Object} plugins // Task plugins
 * @param {Object} config // The config
 * @public
 */
export default function(gulp, plugins, config) {
  const {documentationjs} = plugins;
  const {utils} = config;
  const {addbase, logError} = utils;

  return (gulpCb) => {
    function exit(code) {
      if (typeof gulpCb === 'function') {
        gulpCb();
      }

      process.exit(code);
    }
  };
}
