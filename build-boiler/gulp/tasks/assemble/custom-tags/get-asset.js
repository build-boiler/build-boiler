import nunjucks from 'nunjucks';

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

  addScript({vendors, main, multipleBundles}) {
    const type = 'type="text/javascript"';
    const v = `<script src="${vendors}" ${type}></script>`;
    const m = `<script src="${main}" ${type}></script>`;

    return multipleBundles ? `${v}\n${m}` : m;
  }

  addLink(src) {
    const rel = 'rel="stylesheet"';
    return `<link ${rel} href="${src}">`;
  }

  run(context, args) {
    const {ctx} = context;
    const {assets, webpackConfig} = ctx;
    const {multipleBundles} = webpackConfig;
    const {type} = args;
    let tag, src;

    switch (type) {
      case 'css':
        src = assets.styles.global;
        tag = this.addLink(src);
        break;
      case 'js':
        src = {
          vendors: assets.javascript.vendors,
          main: assets.javascript.main,
          multipleBundles
        };

        tag = this.addScript(src);
        break;
    }

    return new nunjucks.runtime.SafeString(tag || '');
  }
}
