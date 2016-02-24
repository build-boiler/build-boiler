import path from 'path';

export default {
  //isHfa: true,
  shouldRev: true,
  multipleBundles: false,
  bucketBase: undefined,
  devAssets: '/',
  prodAssets: '/',
  devPath: undefined, //ex => 'www.hfa.io'
  prodPath: undefined, //ex => 'www.hillaryclinton.com'
  internalHost: 'localhost',
  includePaths: [],
  assemble: {
    data: {
      userName: process.cwd().split('/')[2]
    },
    registerTags(nunj, app) {

    }
  },
  eslint: {
    basic: false,
    react: true,
    generate: true
  },
  webpack: {
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
    babel: {
      omitPolyfill: false
      //transform: ['transform-runtime', {polyfill: false}]
    }
  },
  isomorphic: {
    context: process.cwd(),
    entries: [
      'lib/components/**.{js,jsx}',
      'lib/bootstrap.js'
    ],
    bootstrap: path.join('lib', 'bootstrap')
  },
  cb(config) {
    //you have access to the gulp config here for
    //any extra customization => don't forget to return config
    return config;
  }
};
