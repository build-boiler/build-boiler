import _ from 'lodash';
import boilerUtils from 'boiler-utils';

export default function(nunj, app, opts = {}) {
  const {isomorphic, fn} = opts;
  const ignore = ['index'];
  const isomorphicTags = ['get-snippet'];
  const add = (Tag) => nunj.addExtension(Tag.name, new Tag(app));
  const {requireDir} = boilerUtils;

  if (!isomorphic) {
    ignore.push(...isomorphicTags);
  }

  const data = requireDir(__dirname, {
    ignore,
    recurse: true,
    dict: 'basename'
  });

  let tags = _.isFunction(fn) ? fn(nunj, app, data) : data;

  if (_.isUndefined(tags)) {
    tags = data;
  }

  if (_.isPlainObject(tags)) {
    Object.keys(tags).forEach(basename => {
      const Tag = tags[basename];

      add(Tag);
    });
  } else if (Array.isArray(tags)) {
    tags.forEach(add);
  }
}