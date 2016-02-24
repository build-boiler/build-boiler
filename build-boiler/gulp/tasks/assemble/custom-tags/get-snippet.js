import React from 'react';
import ReactDOMServer from 'react-dom/server';
import nunjucks from 'nunjucks';

export default class GetSnippet {
  constructor(app) {
    this.app = app;
    this.tags = ['get_snippet'];
  }

  parse(parser, nodes, lexer) {
    let tok = parser.nextToken();
    let args = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(tok.value);
    return new nodes.CallExtension(this, 'run', args);
  }

  run(context, args) {
    const {name, props} = args;
    const snippetKeys = Object.keys(this.app.views.snippets);
    const nameRe = new RegExp(name);
    const [snippetName] = snippetKeys.filter(key => nameRe.test(key));
    const {fluxStore: reactor, ...rest} = props;
    let Component, template;

    try {
      ({fn: Component} = this.app.snippets.getView(`components/${snippetName}`));
    } catch (err) {
      throw new Error(`No React snippet ${snippetName} on assemble context: ${err.message}`);
    }

    try {
      template = ReactDOMServer.renderToString(<Component reactor={reactor} {...rest} />);
    } catch (err) {
      throw new Error(`Error compiling ${snippetName} on assemble context: ${err.message}`);
    }

    return new nunjucks.runtime.SafeString(template);
  }
}
