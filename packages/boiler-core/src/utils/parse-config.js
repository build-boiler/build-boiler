import _ from 'lodash';
import path from 'path';

export default function(root, opts) {
  const methods = {
    tasks(task) {
      const prefix = 'boiler-task-';
      const fp = this.normalizeName(prefix, task);
      const fn = this.tryRequire(fp);

      if (_.isUndefined(fn)) {
        throw new Error(`Cannot find task ${task}`);
      }

      return {
        [task.replace(prefix, '')]: fn
      };
    },

    presets(preset) {
      const prefix = 'boiler-preset-';
      const fp = this.normalizeName(prefix, preset);
      const plugins = this.tryRequire(fp);

      if (_.isUndefined(plugins)) {
        throw new Error(`Cannot find preset ${preset}`);
      }

      plugins.reduce((acc, plugin) => ({
        ...acc,
        ...plugin
      }), {});
    },


    tryRequire(paths) {
      let ret;

      paths.forEach(fp => {
        if (ret) return;
        try {
          ret = require(fp);
        } catch (err) {
          //eslint-disable-line no-empty:0
        }
      });

      return ret;
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
