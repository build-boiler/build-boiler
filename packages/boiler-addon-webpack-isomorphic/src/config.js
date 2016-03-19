import assign from 'lodash/assign';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import isUndefined from 'lodash/isUndefined';
import path from 'path';
import {sync as globSync} from 'globby';
import boilerUtils from 'boiler-utils';
import getExcludes from './utils/gather-commonjs-modules';

export default function(config, data) {
  const {
    environment,
    sources,
    utils,
    webpackConfig,
    isomorphic = {}
  } = config;
  const {isServer} = environment;

  let methods;

  if (isServer) {
    const {buildLogger, renameKey} = boilerUtils;
    const {log, blue} = buildLogger;
    const {buildDir} = sources;
    const {paths} = webpackConfig;
    const {jsBundleName} = paths;
    const {addbase} = utils;
    const {
      context: defaultContext,
      module,
      plugins,
      externals
    } = data;
    const {loaders} = module;
    const {
      entries = [],
        context = defaultContext
    } = isomorphic;
    const files = globSync(entries, {cwd: context});
    const entry = files.reduce((acc, fp) => {
      const name = renameKey(fp);
      log(`Compiling ${blue(name)} component for isomorphic build`);

      return {
        ...acc,
        [name]: [`./${fp}`]
      };
    }, {});

    methods = {
      server() {
        const {devPort, devHost} = sources;
        const {branch, asset_path: assetPath} = environment;
        const bsPath = `http://${devHost}:${devPort}/`;
        const publicPath = isUndefined(branch) ?  bsPath : `${assetPath}/`;
        const {modules = {}} = isomorphic;
        const {target} = modules;

        //HACK: for issue with external jquery in commonjs
        //http://stackoverflow.com/questions/22530254/webpack-and-external-libraries
        const alias = Object.keys(externals || {}).reduce((acc, key) => ({
          ...acc,
          [key]: path.join(__dirname, 'utils', 'mocks', 'noop')
        }), {});

        const serverExternals = getExcludes(config);

        const serverConfig = {
          externals: serverExternals,
          context,
          entry,
          output: {
            path: addbase(buildDir),
            publicPath,
            filename: path.join('js', jsBundleName),
            libraryTarget: 'commonjs2'
          },
          module: {
            loaders
          },
          resolve: {
            alias
          },
          plugins,
          target
        };

        return merge(
          {},
          omit(data, ['externals']),
          serverConfig
        );
      }
    };

  }

  return assign({}, data, {methods});
}
