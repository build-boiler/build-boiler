import {Server} from 'karma';
import _ from 'lodash';
import makeConfig from './karma-config';
import makeBadge from './coverage-badge';
import callParent from '../../utils/run-parent-fn';
import runFn from '../../utils/run-custom-task';

export default function(gulp, plugins, config) {
  const {browserSync} = plugins;
  const {coverage, environment, sources, utils} = config;
  const {devPort, coverageDir} = sources;
  const {addbase, logError} = utils;
  const {isDev} = environment;
  const serverName = 'test_server';

  return (cb) => {
    /**
     * construct the karma config
     */
    const karmaConfig = makeConfig(config);
    const parentConfig = callParent(arguments, {data: karmaConfig});
    const {
      data,
      fn
    } = parentConfig;

    const task = (done) => {
      const server = new Server(data, (code) => {
        if (_.isFunction(done)) {
          /**
           * call the gulp `cb` only once
           */
          const gulpCb = done;
          done = null;

          if (coverage) {

            /**
             * if there is a browser-sync server running displaying code coverage kill it
             */
            if (isDev) {
              const bs = browserSync.get(serverName);
              bs.exit();
            } else {
              makeBadge(config).catch((err) => {
                logError({err, plugin: '[karma: coverage badge]'});
              });
            }
          }

          //hack for karma exit issues https://github.com/karma-runner/karma/issues/1035
          process.exit(code);
          gulpCb();
        }
      });

      /**
       * Start the server
       */
      server.start();

      if (isDev && coverage) {
        const bs = browserSync.create(serverName);
        let hasRun = false;

        /**
         * listen for the first run test complete and start the browser-sync
         * server to display test coverage
         */
        server.on('run_complete', () => {
          if (!hasRun) {
            hasRun = true;

            /**
             * start a browser-sync server to display code coverage
             * and watch all code coverage files for changes
             */
            bs.init({
              server: {
                baseDir: addbase(coverageDir, 'lcov-report')
              },
              files: [{
                match: '**/*.{js,css,html}',
                options: {
                  cwd: coverageDir
                }
              }],
              port: devPort
            });
          }
        });
      }
    }; //end task fn

    return runFn(task, fn, cb);
  }; //end gulp fn
}
