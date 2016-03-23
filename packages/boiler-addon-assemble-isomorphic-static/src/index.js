import jsxLoader from './jsx-loader';
import plugin from './isomorphic-merge-plugin';

export default function(config, opts = {}) {
  return {
    jsxLoader,
    plugin
  };
}
