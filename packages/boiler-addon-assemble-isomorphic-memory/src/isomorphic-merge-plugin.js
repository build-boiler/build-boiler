import _ from 'lodash';
import through from 'through2';
import boilerUtils from 'boiler-utils';

/**
 * Assemble Plugin to merge isomorphic data into Assemble template context
 * @param {Object} app the Assemble instance
 * @param {Boolean} addFluxData whether to add flux data to `file.data`
 *
 * @return {Function} through2 signature
 */
export default function(app, config) {
  const {isomorphic, environment, utils} = config;
  const {isDev, enableIsomorphic} = environment;
  const {logError} = utils;
  const {bootstrap} = isomorphic;
  const addFluxData = !isDev && enableIsomorphic;
  const {buildLogger, renameKey} = boilerUtils;
  const {log, blue} = buildLogger;
  let fluxBootstrap;

  if (addFluxData) {
    ({fn: fluxBootstrap} = app.snippets.getView(renameKey(bootstrap)));
  }

  return through.obj(function(file, enc, cb) {
    const {path, data} = file;

    if (addFluxData) {
      const {isomorphic_data: isoData} = data;
      let key;

      if (_.isPlainObject(isoData)) {
        ({data: key} = isoData);
      } else if (_.isString(isoData)) {
        key = isoData;
      }

      if (_.isUndefined(key)) {

        logError({
          err: new Error('You must specify a `data` key in `isomorphic_data`'),
          plugin: '[assemble: iso-merge]'
        });
      }

      const registerData = data[key] || app.cache.data[key];

      try {
        const props = fluxBootstrap(registerData);
        const {fluxStore: reactor} = props;

        Object.assign(file.data, {
          props,
          globalStore: _.isFunction(reactor && reactor.serialize) && reactor.serialize()
        });
      } catch (err) {
        logError({
          err,
          plugin: '[assemble: iso-merge]'
        });
      }
    }

    log(`Building ${blue(renameKey(path))}`);

    this.push(file);
    cb();
  });
}
