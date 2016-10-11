import nunjucks from 'nunjucks';
import uglify from 'uglify-js';
import cheerio from 'cheerio';

export default class UglifyScript {
  constructor() {
    this.tags = ['uglify_script'];
  }

  parse(parser, nodes, lexer) {
    const tok = parser.nextToken();
    const args = parser.parseSignature(true, true);
    parser.advanceAfterBlockEnd(tok.value);

    const body = parser.parseUntilBlocks('enduglify_script');
    parser.advanceAfterBlockEnd();

    return new nodes.CallExtension(this, 'run', args, [body]);
  }

  run(context, args, body) {
    if (typeof args === 'function') {
      body = args;
      args = null;
    }
    const $ = cheerio.load(body());
    const data = $('script').text();
    const {code} = uglify.minify(data, {
      fromString: true,
      mangle: false
    });
    const tag = `<script type="text/javascript">${code}</script>`;

    return new nunjucks.runtime.SafeString(tag);
  }
}

