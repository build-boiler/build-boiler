import _ from 'lodash';
import through from 'through2';
import renameKey from '../../utils/rename-key';
import log, {blue} from '../../utils/build-logger';

/**
 * Assemble Plugin to merge isomorphic data into Assemble template context
 * @param {Object} app the Assemble instance
 * @param {Boolean} addFluxData whether to add flux data to `file.data`
 *
 * @return {Function} through2 signature
 */
export default function(app, config) {
  const {isomorphic, environment} = config;
  const {isDev, enableIsomorphic} = environment;
  const {bootstrap} = isomorphic;
  const addFluxData = !isDev && enableIsomorphic;
  let fluxBootstrap;

  if (addFluxData) {
    ({fn: fluxBootstrap} = app.snippets.getView(renameKey(bootstrap)));
  }

  return through.obj(function(file, enc, cb) {
    const {path, data} = file;

    if (addFluxData) {
      const {isomorphic_data: dataKey} = data;
      const registerData = data[dataKey] || app.cache.data[dataKey];
      const props = fluxBootstrap(registerData);
      const {fluxStore: reactor} = props;

      Object.assign(file.data, {
        props,
        globalStore: _.isFunction(reactor && reactor.serialize) && reactor.serialize()
      });
    }

    log(`Building ${blue(renameKey(path))}`);

    this.push(file);
    cb();
  });
}
