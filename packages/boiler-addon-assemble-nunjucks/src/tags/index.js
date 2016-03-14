import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';
import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';
import boilerUtils from 'boiler-utils';

export default function(nunj, app, opts = {}) {
  const {
    fn = {},
    addonConfig = {}
  } = opts;
  const isomorphic = addonConfig.isomorphic || opts.isomorphic;
  const parentIgnore = addonConfig.ignore || opts.ignore;
  const {nunjucks: registerFn} = fn;
  const ignore = ['index'];
  const isomorphicTags = ['get-snippet'];
  const add = (Tag) => nunj.addExtension(Tag.name, new Tag(app));
  const {
    requireDir,
    transformArray
  } = boilerUtils;

  if (!isomorphic) {
    ignore.push(...isomorphicTags);
  }

  ignore.push(
    ...transformArray(parentIgnore, isString)
  );

  const data = requireDir(__dirname, {
    ignore,
    recurse: true,
    dict: 'basename'
  });

  let tags = isFunction(registerFn) ? registerFn(nunj, app, data) : data;

  if (isUndefined(tags)) {
    tags = data;
  }

  if (isPlainObject(tags)) {
    Object.keys(tags).forEach(basename => {
      const Tag = tags[basename];

      add(Tag);
    });
  } else if (Array.isArray(tags)) {
    tags.forEach(add);
  }
}
