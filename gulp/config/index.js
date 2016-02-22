import path from 'path';
import {PropTypes} from 'react';
import {provideReactor} from 'nuclear-js-react-addons';
import {dependencies, devDependencies} from '../../package';

export default {
  isHfa: true,
  shouldRev: true,
  bucketBase: 'bloop',
  devAssets: '',
  prodAssets: '',
  devPath: undefined, //ex => 'www.hfa.io'
  prodPath: undefined, //ex => 'www.hillaryclinton.com'
  internalHost: 'localhost',
  includePaths: [],
  assemble: {
    data: {
      userName: process.cwd().split('/')[2],
      provider(comp) {
        return provideReactor(comp, {
          Actions: PropTypes.object,
          Getters: PropTypes.object,
          id: PropTypes.string
        });
      }
    },
    /**
     * Add and omit custom tags
     * @param {Object} nunj Nunjucks instance
     * @param {Object} app Assemble instance
     * @param {Object} tags tag names => tag fn from BuildBoiler
     *
     * @return {Array|Object|undefined} filter tags to ignore them or return `undefined` to not ignore
     */
    registerTags(nunj, app, tags) {

      //return _.omit(tags, 'getSnippet');
      //return Object.keys(tags).reduce((list, fp) => {
        //return fp === 'getSnippet' ? list : [...list, tags[fp]];
      //}, []);
    },
    middleware: {
      /**
       * Pass a function or array of functions
       * ex. (file, next) =>
       * ex. (config) => (file, next) =>
       */
      preRender: [
        (file, next) => {

        },
        (config) => {
          return (file, next) => {

          };
        }
      ],
      onload(config) {
        return (file, next) => {

        };
      }
    }
  },
  browserSync: {
    middleware(config, m) {

      return m;
    },
    //open: true
    open: (config, fp) => {

      //return => path to open
    }
  },
  eslint: {
    basic: false,
    react: true,
    generate: true
  },
  webpack: {
    base: {
      //node: {
        //dns: 'mock',
        //net: 'mock',
        //fs: 'empty'
      //}
    },
    moduleRoot: [
      path.join(process.cwd(), 'lib')
    ],
    middleware(config, app) {

    },
    //options = Boolean|Object
    //multipleBundles: true,
    multipleBundles: {
      omitEntry: true,
      glob: path.join('templates', 'pages', '**', '*.js'),
      base: path.join(process.cwd(), 'src')//default to `templates/pages`
    },
    expose: {
      /*modules to expose globally ex. => js-cookie: 'Cookie'*/
      'js-cookie': 'Cookie',
      'query-string': 'qs'
    },
    alias: {
      /*alias modules ex. => underscore: 'lodash'*/
    },
    hot: true,
    externals: [ //declare external modules and pass then to the ProvidePlugin
      {
        name: {
          jquery: 'jQuery'
        },
        provide: {
          'global.jQuery': 'jquery',
          'window.jQuery': 'jquery',
          '$': 'jquery'
        }
      }
    ],
    vendors: [
      /*only use if using multiple bundles ex. => [react, reactdom, lodash]*/
    ],
    env: {
      /**
       * data passed as `process.env` for dependency injection with Webpack `DefinePlugin`
       * ex. SOME_VAR: JSON.stringify('something')
       */
    },
    //p => plugins Array
    plugins(config, p) {
      return p;
    },
    loaders(config, l) {
      const {preLoaders, loaders, postLoaders} = l;

      return {
        preLoaders,
        loaders,
        postLoaders
      };
    },
    babel: {
      omitPolyfill: false,
      //transform: ['transform-runtime', {polyfill: false}]
      query(config, q) {

      },
      babelrc(config, rc) {

      },
      exclude(config, fp) {
        //return /node_modules/.test(fp)
      }
      //exclude: /node_modules/,
      //exclude: [/node_modules/, /something/]
    }
  },
  isomorphic: {
    context: process.cwd(),
    entries: [
      'lib/components/**.{js,jsx}',
      'lib/bootstrap.js'
    ],
    bootstrap: path.join('lib', 'bootstrap'),
    modules: {
      include: [],
      exclude: [
        ...Object.keys(dependencies),
        ...Object.keys(devDependencies)
      ],
      target: 'node'
    }
  },
  karma: {
    browsers: {},
    devices: {},
    coverageRe: /^.+?\/src\/js\/(?:services|modules|component-utils|module-utils)\/.+?\.jsx?$/
  },
  webdriver: {
    browsers: [],
    devices: []
  },
  cb(config) {
    //you have access to the gulp config here for
    //any extra customization => don't forget to return config
    return config;
  }
};
