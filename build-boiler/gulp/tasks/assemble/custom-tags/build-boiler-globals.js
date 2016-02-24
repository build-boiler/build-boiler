import nunjucks from 'nunjucks';
import UglifyJS from 'uglify-js';

export default class BuildBoilerGlobals {
  constructor() {
    this.tags = ['build_boiler_globals'];
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

  run(context, args, body, cb) {
    const {global_data: globalData = ''} = context.ctx;
    const {name, data: data = globalData, uglify: uglify = true} = args;
    const contents = `
      window.buildBoilerGlobals = window.buildBoilerGlobals || {};
      window.buildBoilerGlobals["${name || 'globalData'}"] = ${JSON.stringify(data)};
    `;
    let processed;

    if (uglify) {
      processed = UglifyJS.minify(contents, {
        fromString: true,
        mangle: false
      }).code;
    }

    const tag = `<script type="text/javascript">${processed || contents}</script>`;

    return new nunjucks.runtime.SafeString(tag);
  }
}
