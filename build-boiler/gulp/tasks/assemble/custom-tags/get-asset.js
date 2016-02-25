import nunjucks from 'nunjucks';
import renameKey from '../../../utils/rename-key';

export default class GetAsset {
  constructor(app) {
    this.app = app;
    this.tags = ['get_asset'];
  }

  parse(parser, nodes, lexer) {
    const tok = parser.nextToken();
    const args = parser.parseSignature(null, true);

    if (args.children.length === 0) {
      args.addChild(new nodes.Literal(0, 0, ''));
    }

    parser.advanceAfterBlockEnd(tok.value);
    return new nodes.CallExtension(this, 'run', args);
  }

  script(src) {
    const type = 'type="text/javascript"';

    return `<script src="${src}" ${type}></script>`;
  }

  addScript({vendors, main, page}) {
    const list = [];

    vendors && list.push(this.script(vendors));
    main && list.push(this.script(main));
    page && list.push(this.script(page));

    return list.join('\n');
  }

  addLink({src}) {
    const rel = 'rel="stylesheet"';
    return `<link ${rel} href="${src}">`;
  }

  run(context, args) {
    const {ctx} = context;
    const {assets, view} = ctx;
    const {javascript, styles} = assets;
    const {path: viewPath} = view;
    const {type, version = '1.0.0'} = args;
    const pageBundle = javascript[renameKey(viewPath, 'main')];
    let tag, src;

    switch (type) {
      case 'pantsuit':
        tag = this.addLink({
          src: `https://a.hrc.onl/pantsuit/v${version}/css/pantsuit.css`
        });
        break;
      case 'css':
        src = styles.global;
        tag = this.addLink({src});
        break;
      case 'js':
        src = {
          vendors: javascript.vendors,
          main: javascript.main,
          page: pageBundle
        };

        tag = this.addScript(src);
        break;
    }

    return new nunjucks.runtime.SafeString(tag || '');
  }
}
