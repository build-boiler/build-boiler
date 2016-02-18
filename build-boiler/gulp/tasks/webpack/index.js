import {assign, isFunction} from 'lodash';
import webpack from 'webpack';
import makeConfig from './make-webpack-config';

export default function(gulp, plugins, config) {
  const {sources, utils, environment} = config;
  const {mainBundleName} = sources;
  const {isDev, asset_path: assetPath} = environment;
  const {getTaskName} = utils;
  const {devPort, devHost} = sources;
  const {gutil, app} = plugins;
  let publicPath;

  return (cb) => {
    const task = getTaskName(gulp.currentTask);
    const isMainTask = task === mainBundleName;
    const bsPath = `http://${devHost}:${devPort}/`;

    publicPath = isDev ?  bsPath : `${assetPath}/`;

    const baseConfig = assign({}, config, {isMainTask, publicPath, app});
    const webpackConfig = makeConfig(baseConfig);
    const compiler = webpack(webpackConfig);

    function logger(err, stats) {
      if (err) {
        throw new gutil.PluginError({
          plugin: '[webpack]',
          message: err.message
        });
      }

      if (!isDev) {
        gutil.log(stats.toString());
      }
    }

    compiler.plugin('compile', () => {
      gutil.log(`Webpack Bundling ${task} bundle`);
    });

    compiler.plugin('done', (stats) => {
      gutil.log(`Webpack Bundled ${task} bundle in ${stats.endTime - stats.startTime}ms`);

      if (stats.hasErrors() || stats.hasWarnings()) {
        const {errors, warnings} = stats.toJson({errorDetails: true});

        [errors, warnings].forEach((stat, i) => {
          let type = i ? 'warning' : 'error';
          if (stat.length) {
            const [statStr] = stat;
            /*eslint-disable*/
            const [first, ...rest] = statStr.split('\n\n');
            /*eslint-enable*/
            if (rest.length) {
              gutil.log(`[webpack: ${task} bundle ${type}]\n`, rest.join('\n\n'));
            } else {
              gutil.log(`[webpack: ${task} bundle ${type}]`, stats.toString());
            }
          }
        });

        if (!isDev) {
          process.exit(1);
        }
      }

      //avoid multiple calls of gulp callback
      if (isFunction(cb)) {
        let gulpCb = cb;
        cb = null;

        gulpCb();
      }
    });

    if (isDev) {
      compiler.watch({
        aggregateTimeout: 300,
        poll: true
      }, logger);
    } else {
      compiler.run(logger);
    }
  };
}
