import path from 'path';
import merge from 'lodash/merge';
import jsdom from 'jsdom';
import MemoryFS from 'memory-fs';
import boilerUtils from 'boiler-utils';
import makeWebpackConfig from 'boiler-config-webpack';
import webpack from 'webpack';

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

  if (!global.document) global.document = doc;
  if (!global.window) global.window = win;
  if (!global.navigator) global.navigator = win.navigator;

  const {
    buildLogger,
    compileModule: compile
  } = boilerUtils;
  const {log, blue} = buildLogger;

  /**
   * @param {Object} data any additional context
   * @param {Function} cb callback to be called at the end
   *
   * @return {undefined} use the cb
   */
  collection.load = (config, cb) => {
    const {
      isomorphic = {},
      webpackConfig: baseConfig
    } = config;
    const {memory} = isomorphic;
    const {webpackPaths} = baseConfig;
    const [jsBundleName] = webpackPaths.jsBundleName;

    const serverConfig = merge({},
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

    const webpackConfig = makeWebpackConfig(serverConfig);
    const {entry} = webpackConfig;

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
    const {sources} = config;
    const {scriptDir} = sources;
    const {path: outDir} = webpackConfig.output;
    let fs;

    if (memory) {
      fs = new MemoryFS();
      compiler.outputFileSystem = fs;
    }

    compiler.run((err, stats) => {
      if (err) return cb(err);

      Object.keys(entry).forEach(file => {
        const filename = `${file}.js`;
        const fp = path.join(outDir, scriptDir, filename);
        log(`Finished Compiling ${blue(file)} component`);
        let contents, fn;

        if (memory) {
          contents = fs.readFileSync(fp);
          fn = compile(contents);
        } else {
          contents = '';
          fn = require(fp);
        }

        collection.addView(file, {
          path: file,
          contents,
          fn
        });
      });

      cb(null);
    });
  };
}
