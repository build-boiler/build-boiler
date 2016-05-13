import _ from 'lodash';
import yargs from 'yargs';

/**
 * Create command line options
 * @param {Object} opts.cli additional cli options
 * @return {Object}
 */
export default function(opts = {}) {
  const {cli = {}, env} = opts;
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
    },
    // Number of instances to run in parallel (boiler-task-selenium)
    instances: {
      type: 'number',
      default: 1
    },
    t: {
      alias: 'test',
      type: 'boolean',
      default: false
    },
    ...cli
  });

  const devTasks = [
    'watch',
    'test:integration'
  ];

  if (_.intersection(argv._, devTasks).length || env === devKey) {
    argv.ENV = devKey;
  } else if (env === prodKey) {
    argv.ENV = prodKey;
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

  return cliConfig;
}
