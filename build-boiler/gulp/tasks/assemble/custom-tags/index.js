import requireDir from '../../../utils/require-dir';

export default function(nunj, app) {
  const data = requireDir(__dirname, {
    ignore: 'index',
    recurse: true
  });

  data.forEach(Tag => nunj.addExtension(Tag.name, new Tag(app)) );
}
