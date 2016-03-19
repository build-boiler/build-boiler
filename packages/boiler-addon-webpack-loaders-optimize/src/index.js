import assign from 'lodash/assign';

export default function(config, data) {
  const {
    toolsPlugin,
    DEBUG
  } = config;

  if (!DEBUG) {
    const {loaders} = data;
    const imageLoader = 'img?' + [
      'progressive=true',
      'minimize'
    ].join('&');
    const re = toolsPlugin.regular_expression('images').toString();
    const optimizedLoaders = loaders.map(data => {
      const {test} = data;
      let ret = data;

      if (test.toString() === re) {
        const {loader} = data;

        ret = assign({}, data, {
          loader: [loader, imageLoader].join('!')
        });
      }

      return ret;
    });

    data.loaders = optimizedLoaders;
  }

  return data;
}
