import {assign, isFunction} from 'lodash';
import webpack from 'webpack';
import makeConfig from './make-webpack-config';
import callParent from '../../utils/run-parent-fn';
import runFn from '../../utils/run-custom-task';

export default function(gulp, plugins, config) {
  const {sources, utils, environment} = config;
  const {mainBundleName} = sources;
  const {isDev, asset_path: assetPath} = environment;
  const {getTaskName} = utils;
  const {devPort, devHost} = sources;
  const {gutil, app} = plugins;
  let publicPath;

  return (cb) => {
    const taskName = getTaskName(gulp.currentTask);
    const isMainTask = taskName === mainBundleName;
    const bsPath = `http://${devHost}:${devPort}/`;

    publicPath = isDev ?  bsPath : `${assetPath}/`;

    const baseConfig = assign({}, config, {isMainTask, publicPath, app});
    const webpackConfig = makeConfig(baseConfig);
    const parentConfig = callParent(arguments, {data: webpackConfig});
    const {
      data,
      fn
    } = parentConfig;

    const task = (done) => {
      const compiler = webpack(data);

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
        gutil.log(`Webpack Bundling ${taskName} bundle`);
      });

      compiler.plugin('done', (stats) => {
        gutil.log(`Webpack Bundled ${taskName} bundle in ${stats.endTime - stats.startTime}ms`);

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
                gutil.log(`[webpack: ${taskName} bundle ${type}]\n`, rest.join('\n\n'));
              } else {
                gutil.log(`[webpack: ${taskName} bundle ${type}]`, stats.toString());
              }
            }
          });

          if (!isDev) {
            process.exit(1);
          }
        }

        //avoid multiple calls of gulp callback
        if (isFunction(done)) {
          let gulpCb = done;
          done = null;

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

    return runFn(task, fn, cb);
  };
}
