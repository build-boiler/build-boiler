import _ from 'lodash';
import glob from 'globby';
import jsdom from 'jsdom';
import webpack from 'webpack';
import MemoryFS from 'memory-fs';
import gutil from 'gulp-util';
import renameKey from '../../utils/rename-key';
import makeWebpackConfig from '../webpack/make-webpack-config';
import compile from '../../utils/compile-module';

const {colors, log} = gutil;
const {magenta, blue} = colors;

/**
 * Loader to compile React components and es6 functions with Webpack
 * memory-fs and put them on the `snippets` Assemble collection
 *
 * @param {Object} collection instance provided by assemble
 *
 * @return {Function} function re-defining a `load` method
 */
export default function(collection) {
  const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
  const win = doc.defaultView;

  global.document = doc;
  global.window = win;
  global.navigator = win.navigator;

  /**
   * @param {String|Array} patterns glob patterns
   * @param {Object} options glob options
   * @param {Object} data any additional context
   * @param {Function} cb callback to be called at the end
   *
   * @return {undefined} use the cb
   */
  collection.load = (patterns, options = {}, config, cb) => {
    const files = glob.sync(patterns, options);
    const entry = files.reduce((acc, fp) => {
      const name = renameKey(fp);
      log(`Compiling ${magenta(name)} component for isomorphic build`);

      return {
        ...acc,
        [name]: [`./${fp}`]
      };
    }, {});

    const {webpackConfig: baseConfig} = config;
    const {webpackPaths} = baseConfig;
    const [jsBundleName] = webpackPaths.jsBundleName;

    const fs = new MemoryFS();
    const serverConfig = _.merge({},
      config,
      {
        ENV: 'server',
        environment: {
          isServer: true
        },
        webpackConfig: {
          paths: {
            jsBundleName
          }
        }
      }
    );

    serverConfig.sources.entry = entry;

    const webpackConfig = makeWebpackConfig(serverConfig);

    webpackConfig.plugins.push(
      function() {
        this.plugin('done', (stats) => {
          const {errors} = stats.compilation || {};

          if (errors && errors.length) {
            errors.forEach(error => log(error.message));
          }
        });
      }
    );

    const compiler = webpack(webpackConfig);
    const {sources, utils} = config;
    const {buildDir, scriptDir} = sources;
    const {addbase} = utils;

    compiler.outputFileSystem = fs;

    compiler.run((err, stats) => {
      if (err) return cb(err);

      Object.keys(entry).forEach(file => {
        const filename = `${file}.js`;
        const fp = addbase(buildDir, scriptDir, filename);
        log(`Finished Compiling ${blue(file)} component`);
        const contents = fs.readFileSync(fp);

        collection.addView(file, {
          path: file,
          contents,
          fn: compile(contents)
        });
      });
      cb(null);
    });
  };
}
