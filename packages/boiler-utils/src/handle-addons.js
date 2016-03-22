import _ from 'lodash';
import path from 'path';
import tryExists from './try-exists';
import installDeps from './install-peer-dep';

/**
 * Utility for handling data passed to `addons`
 * @param {Array} addons
 * @return {Object}
 */
export default function(addons = [], root) {
  const cwd = process.cwd();
  const prefix = 'boiler-addon-';

  /**
   * Take an addon string, parse it's file name and try to `require` it
   * ex. `boiler-addon-assemble-nunjucks`
   */
  function getAddon(addon) {
    let baseName;

    installDeps(root, addon);

    let fn = tryExists(
      addon.indexOf(cwd) === -1 ? path.join(cwd, addon) : addon,
      {resolve: true}
    );

    if (fn) {
      //if the addon is from a local folder => not `node_modules`
      ([baseName] = addon.split(path.sep).slice(-1));
    } else {
      const fullName = addon.indexOf(prefix) === -1 ? prefix + addon : addon;
      baseName = fullName.replace(prefix, '');

      //if the addon is in `packages` locally or `node_modules`
      fn = fn || tryExists(path.join(root, fullName), {resolve: true});
    }

    if (!fn) {
      throw new Error(`Addon not found ${addon}`);
    }

    const split = baseName.split('-');
    const [task, ...rest] = split;
    const name = rest.join('-');

    return {
      name,
      task,
      fn
    };
  }

  return addons.reduce((acc, addon) => {
    const payload = {};
    let name, task, fn, opts;

    if (_.isString(addon)) {
      ({name, task, fn} = getAddon(addon));
      payload[name] = fn;
    } else if (Array.isArray(addon)) {
      ([name, opts] = addon);
      ({name, task, fn} = getAddon(name));
      payload[name] = opts ? [fn, opts] : fn;
    }

    const data = acc[task] = acc[task] || {};

    Object.assign(data, payload);

    return acc;
  }, {});
}
