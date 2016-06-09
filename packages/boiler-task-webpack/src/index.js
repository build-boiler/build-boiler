import assign from 'lodash/assign';
import merge from 'lodash/merge';
import isFunction from 'lodash/isFunction';
import isUndefined from 'lodash/isUndefined';
import boilerUtils from 'boiler-utils';
import Express from 'express';
import middleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';
import makeConfig from 'boiler-config-webpack';
import webpack from 'webpack';
import {remove} from 'fs-extra';
import async from 'async';
import {sync as glob} from 'globby';

export default function(gulp, plugins, config) {
  const {metaData, sources, utils, environment, webpackConfig} = config;
  const {isDev, isIE, isMaster, asset_path: assetPath, branch} = environment;
  const {middleware: parentMiddleware, hot} = webpackConfig;
  const {getTaskName, addbase, logError} = utils;
  const {mainBundleName, globalBundleName, buildDir, devPort, devHost, hotPort} = sources;
  const {gutil} = plugins;
  const {
    runParentFn: callParent,
    runCustomTask: runFn
  } = boilerUtils;
  let publicPath;

  return (cb) => {
    const taskName = getTaskName(metaData);
    const isMainTask = taskName === mainBundleName;
    const isGlobalTask = taskName === globalBundleName;
    const isServer = taskName === 'server';
    const runHot = isMainTask && !isIE && hot;

    const devPath = isDev ? `http://${devHost}:${hotPort}/` : '/';
    const bsPath = isDev ? `http://${devHost}:${devPort}/` : '/';

    if (runHot) {
      publicPath = isUndefined(branch) ?  devPath : assetPath;
    } else {
      publicPath = isUndefined(branch) ?  bsPath : assetPath;
    }

    const baseConfig = assign({}, config, {
      isMainTask,
      isGlobalTask,
      publicPath,
      taskName
    });

    if (isServer) {
      merge(baseConfig, {
        ENV: 'server',
        environment: {
          isServer: true
        }
      });
    }

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

          if (isMaster) {
            //hack to remove SCSS sourcemaps in PROD
            const maps = glob(
              addbase(buildDir, 'css', '**/*.css.map')
            );
            async.map(maps, remove, (err) => {
              if (err) logError({err, plugin: '[webpack: delete .map]'});

              gulpCb();
            });
          } else {
            gulpCb();
          }
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

          isFunction(parentMiddleware) && parentMiddleware(config, app);

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
