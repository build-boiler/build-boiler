import path from 'path';
import {sync as globSync} from 'globby';
import {fork} from 'child_process';
import merge from 'lodash/merge';
import isFunction from 'lodash/isFunction';
import intersection from 'lodash/intersection';
import open from 'open';
import boilerUtils from 'boiler-utils';

export default function(gulp, plugins, config) {
  const {
    tryExists,
    callAndReturn: initParentFn,
    runParentFn: callParent,
    runCustomTask: runFn
  } = boilerUtils;
  const {environment, sources, utils, ENV} = config;
  const {buildDir, internalHost, devPort, serverPort} = sources;
  const {branch, isDev} = environment;
  const {addbase} = utils;
  const protocol = 'http://';
  const devPath = `${protocol}${internalHost}:${devPort}`;
  const serverPath = `${protocol}${internalHost}:${serverPort}`;
  const browserSyncIsActive = intersection(['browser-sync', 'watch', 'serve'], process.argv).length > 0;
  const initialOpenPath = browserSyncIsActive ? devPath : serverPath;
  const {nodemon: parentConfig} = config;

  return (cb) => {
    const callConfigFn = initParentFn(config);
    /**
     * Get config from `gulp/config/index.js
     */
    const baseConfig = {
      script: path.join(isDev ? '' : buildDir, 'lib', 'entry', 'index.js'),
      env: {
        BRANCH: branch || 'local',
        NODE_ENV: ENV,
        OPEN: initialOpenPath
      },
      openPath: initialOpenPath,
      open: false,
      watch: [
        'lib/**/*.js',
        '!' + 'lib/node_modules/**'
      ],
      cwd: isDev ? process.cwd() : addbase(buildDir)
    };

    if (!isDev) {
      merge(baseConfig, {
        env: {
          STACK: 'local'
        }
      });
    }

    const nodemonConfig = callConfigFn(parentConfig, baseConfig);

    /**
     * Call the parent gulp task if one exists
     */
    const {
      data: processedConfig,
      fn
    } = callParent(arguments, {data: nodemonConfig});

    const task = (done) => {
      const {
        delay = '3',
        script,
        env,
        openPath,
        open: shouldOpen,
        watch: watchDirs,
        cwd
      } = processedConfig;

      const dirs = globSync(watchDirs, {cwd});
      const watch = dirs.reduce((list, dir) => {
        list.push(...[
          '--watch',
          dir
        ]);

        return list;
      }, []);
      const binPath = 'nodemon/bin/nodemon.js';
      const binaryPath =
        tryExists(binPath, {resolve: true, omitReq: true}) ||
        tryExists(path.resolve(__dirname, '..', `node_modules/${binPath}`), {omitReq: true});
      const cp = fork(
        binaryPath,
        [
          script,
          ...watch,
          '-d', delay,
          '--es_staging'
        ],
        {
          env: {
            ...env,
            ...process.env
          },
          stdio: 'inherit',
          cwd
        }
      );

      cp.on('message', (event) => {
        if (event.type === 'start' && isFunction(done)) {
          const gulpCb = done;
          done = null;

          if (shouldOpen) {
            isFunction(shouldOpen) ? shouldOpen(openPath) : open(openPath);
          }

          gulpCb();
        }
      });
    };

    return runFn(task, fn, cb);
  };
}
