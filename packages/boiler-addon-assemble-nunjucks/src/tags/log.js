export default class Log {
  constructor() {
    this.tags = ['log'];
  }

  parse(parser, nodes, lexer) {
    const tok = parser.nextToken();
    const args = parser.parseSignature(null, true);

    parser.advanceAfterBlockEnd(tok.value);
    return new nodes.CallExtension(this, 'run', args);
  }

  run(context, ...args) {
    console.log('\n***START LOG***');

    args.forEach(arg => {
      console.log(arg);
    });

    console.log('***END LOG***\n');
  }
}


