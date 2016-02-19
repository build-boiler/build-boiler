import _ from 'lodash';
import path from 'path';
import yargs from 'yargs';
import loadPlugins from 'gulp-load-plugins';

export default function(root) {
  const devKey = 'development';
  const prodKey = 'production';
  const {argv} = yargs
  .usage('Usage: $0 <gulp> $1 <gulp_task> [-e <environment> -f <file_to_test>]')
  .options({
    b: {
      alias: 'browser',
      type: 'string'
    },
    coverage: {
      type: 'boolean',
      default: false
    },
    d: {
      alias: 'desktop'
    },
    e: {
      alias: 'ENV',
      default: prodKey
    },
    f: {
      alias: 'file',
      type: 'string'
    },
    force: {
      type: 'boolean'
    },
    l: {
      alias: 'library',
      type: 'string'
    },
    local: {
      type: 'boolean'
    },
    m: {
      alias: 'mobile'
    },
    r: {
      alias: 'release',
      type: 'boolean'
    },
    q: {
      alias: 'quick',
      type: 'boolean'
    }
  });

  if (argv._.indexOf('watch') !== -1) {
    argv.ENV = devKey;
  }

  /**
   * Filter out undefined and un-necessary keys
   */
  const keys = Object.keys(argv);
  const cliConfig = keys
  .filter(key => ['_', '$0', 'e'].indexOf(key) === -1 && argv[key])
  .reduce((acc, key) => {
    let val = argv[key];

    //support legacy options of `-e dev` or `-e prod`
    if (key === 'ENV') {
      switch (val) {
        case 'dev':
          val = devKey;
          break;
        case 'prod':
          val = prodKey;
          break;
      }
    }

    /**
     * normalize array values
     */
    switch (key) {
      //multiple intentional fall through
      case 'm':
      case 'mobile':
      case 'd':
      case 'desktop':
        val = _.isString(val) ? val.split(',') : val;
        break;
    }

    return {
      ...acc,
      [key]: val
    };
  }, {});

  /**
   * Load all of the gulp plugins
   */
  const pluginOpts = {
    lazy: false,
    pattern: [
      'gulp-*',
      'gulp.*',
      'del',
      'run-sequence',
      'browser-sync'
    ],
    rename: {
      'gulp-util': 'gutil',
      'run-sequence': 'sequence',
      'gulp-if': 'gulpIf'
    }
  };

  const modulePlugins = loadPlugins(
    _.assign({}, pluginOpts, {config: path.join(root, 'package.json'), scope: ['dependencies']})
  );
  const rootPlugins = loadPlugins(
    _.assign({}, pluginOpts, {config: path.join(process.cwd(), 'package.json')})
  );

  return {
    cliConfig,
    plugins: _.assign({}, modulePlugins, rootPlugins)
  };
}
