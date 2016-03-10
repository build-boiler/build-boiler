import _ from 'lodash';
import path from 'path';
import boilerUtils from 'boiler-utils';

export default function(root, opts) {
  const {tryExists, buildLogger} = boilerUtils;
  const {prefix: logP, blue} = buildLogger;
  const methods = {
    tasks(task) {
      const prefix = 'boiler-task-';
      const paths = this.normalizeName(prefix, task);
      let fn;

      paths.forEach(fp => {
        if (fn) return;
        fn = tryExists(fp, {resolve: true});
      });

      if (_.isUndefined(fn)) {
        throw new Error(`${logP} Cannot find task ${blue(task)}`);
      }

      return {
        [task.replace(prefix, '')]: fn
      };
    },

    presets(preset) {
      const prefix = 'boiler-preset-';
      const paths = this.normalizeName(prefix, preset);
      let plugins;

      paths.forEach(fp => {
        if (plugins) return;
        plugins = tryExists(fp, {resolve: true});
      });

      if (_.isUndefined(plugins)) {
        throw new Error(`${logP} Cannot find preset ${blue(preset)}`);
      }

      return plugins.reduce((acc, plugin) => ({
        ...acc,
        ...plugin
      }), {});
    },

    normalizeName(prefix, name) {
      const norm = name.indexOf(prefix) !== -1 ? name : prefix + name;

      return [
        path.join(root, 'node_modules', norm),
        path.join(root, norm)
      ];
    },

    recurse(method, data) {
      return Array.isArray(data) ? data.reduce((acc, name) => ({
        ...acc,
        ...this[method](name)
      }), {}) : {};
    }
  };

  return opts ? Object.keys(opts).reduce((acc, name) => ({
    ...acc,
    ...methods.recurse(name, opts[name])
  }), {}) : methods;
}
