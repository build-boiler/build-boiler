import requireDir from '../../../utils/require-dir';

export default function(nunj, app, opts = {}) {
  const {omit = [], isomorphic} = opts;
  const ignore = ['index'];
  const omitSnippet = !isomorphic && omit.indexOf('get-snippet') === -1;
  const isomorphicTags = ['get-snippet'];

  if (omitSnippet) {
    ignore.push(...isomorphicTags);
  }

  Array.isArray(omit) ? ignore.push(...omit) : ignore.push(omit);

  const data = requireDir(__dirname, {
    ignore,
    recurse: true
  });

  data.forEach(Tag => nunj.addExtension(Tag.name, new Tag(app)) );
}
