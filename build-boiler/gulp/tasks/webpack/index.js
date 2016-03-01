import {assign, isFunction, isUndefined} from 'lodash';
import webpack from 'webpack';
import makeConfig from './make-webpack-config';
import callParent from '../../utils/run-parent-fn';
import runFn from '../../utils/run-custom-task';
import Express from 'express';
import middleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';

export default function(gulp, plugins, config) {
  const {sources, utils, environment, webpackConfig} = config;
  const {mainBundleName} = sources;
  const {isDev, isIE, asset_path: assetPath, branch} = environment;
  const {hot} = webpackConfig;
  const {getTaskName} = utils;
  const {buildDir, devPort, devHost, hotPort} = sources;
  const {gutil, app} = plugins;
  let publicPath;

  return (cb) => {
    const taskName = getTaskName(gulp.currentTask);
    const isMainTask = taskName === mainBundleName;
    const runHot = isMainTask && !isIE && hot;

    const devPath = isDev ? `http://${devHost}:${hotPort}/` : '/';
    const bsPath = isDev ? `http://${devHost}:${devPort}/` : '/';

    if (runHot) {
      publicPath = isUndefined(branch) ?  devPath : assetPath;
    } else {
      publicPath = isUndefined(branch) ?  bsPath : assetPath;
    }

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
        if (runHot) {
          const app = new Express();
          const serverOptions = {
            contentBase: buildDir,
            quiet: true,
            noInfo: true,
            hot: true,
            inline: true,
            lazy: false,
            publicPath,
            headers: {'Access-Control-Allow-Origin': '*'},
            stats: {colors: true}
          };
          let hasRun = false;

          app.use(middleware(compiler, serverOptions));
          app.use(hotMiddleware(compiler));

          compiler.plugin('done', (stats) => {
            if (!hasRun) {
              app.listen(hotPort, (err) => {
                if (err) {
                  console.error(err);
                } else {
                  console.info('==> 🚧  Webpack development server listening on port %s', hotPort);
                }

                hasRun = true;
              });
            }
          });
        } else {
          compiler.watch({
            aggregateTimeout: 300,
            poll: true
          }, logger);
        }
      } else {
        compiler.run(logger);
      }
    };

    return runFn(task, fn, cb);
  };
}
