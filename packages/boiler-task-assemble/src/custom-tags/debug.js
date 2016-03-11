export default class Debug {
  constructor(app) {
    this.app = app;
    this.tags = ['debug'];
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

  run(context, args) {
    const {ctx} = context;
    const {key} = args;

    if (key) {
      const split = key.split('.');
      const data = split.length === 1 ? ctx[key] : split.reduce((ctxData, currentKey) => ctxData[currentKey], ctx);
      console.log(`\n****${key.toUpperCase()} CONTEXT****\n`, data);
    } else {
      console.log('\n****PAGE CONTEXT****\n', ctx);
    }
  }
}

