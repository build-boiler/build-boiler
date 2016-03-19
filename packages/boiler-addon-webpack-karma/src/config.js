import assign from 'lodash/assign';
import modifyQuery from './utils/add-rewire';

export default function(config, data) {
  const {ENV} = config;
  const TEST = ENV === 'test' || ENV === 'ci';
  const externals = {
    'sinon': 'window.sinon'
  };

  if (TEST) {
    const {loaders = [], postLoaders = []} = data.module || {};
    const [babelLoader] = loaders.filter(({loader}) => /babel/.test(loader));
    const {query} = babelLoader;
    const babelQuery = modifyQuery(query);
    const coverageConfig = {
      isparta: {
        embedSource: true,
        noAutoWrap: true,
        babel: babelQuery
      }
    };

    data.methods = data.methods || {};
    data.externals = data.externals || {};

    assign(data.externals, externals);

    const methods = {
      test() {
        const testConfig = {
          watch: true,
          devtool: 'inline-source-map'
        };

        return assign({}, data, testConfig, coverageConfig);
      },

      ci() {
        const uglifyLoader = {
          test: /\.jsx?$/,
          loader: 'uglify',
          exclude: /\-spec\.js$/
        };
        const ciConfig = {
          // allow getting rid of the UglifyJsPlugin
          // https://github.com/webpack/webpack/issues/1079
          'uglify-loader': {
            compress: {warnings: false}
          }
        };

        postLoaders.push(uglifyLoader);

        return assign({}, data, ciConfig, coverageConfig);
      }
    };

    assign(data.methods, methods);
  }

  return data;
}
