import boilerUtils from 'boiler-utils';

/**
 * Utility to add nunjucks tags
 * TODO: add options for allowing user to add tags from `gulp/config/index`
 * @param {Object} nunj Nunjucks instance
 * @param {Object} opts options
 *
 * @return {Undefined} registers tags
 */
export default function(nunj, opts = {}) {
  const {requireDir} = boilerUtils;

  const data = requireDir(__dirname, {
    ignore: 'index',
    recurse: true,
    dict: 'basename'
  });

  Object.keys(data).forEach(filterName => {
    const filter = data[filterName];

    nunj.addFilter(filterName, filter);
  });
}

