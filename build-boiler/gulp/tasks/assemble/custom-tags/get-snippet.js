import path from 'path';
import _ from 'lodash';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import nunjucks from 'nunjucks';

export default class GetSnippet {
  constructor(app) {
    this.app = app;
    this.tags = ['get_snippet'];
    this.snippets = [];
  }

  parse(parser, nodes, lexer) {
    let tok = parser.nextToken();
    let args = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(tok.value);
    return new nodes.CallExtension(this, 'run', args);
  }

  getComponent(keys) {
    return (name, init) => {
      const [snippetName] = keys.filter(key => path.basename(key) === name);

      this.snippets.push(snippetName);

      return this.app.snippets.getView(`${snippetName}`).fn;
    };
  }

  run(context, args) {
    const {name, props, wrapper} = args;
    const snippetKeys = Object.keys(this.app.views.snippets);
    const {fluxStore: reactor, ...rest} = props;
    const snippetFn = this.getComponent(snippetKeys);
    let children, Component, Wrapper, snippetName, template;

    try {
      if (Array.isArray(name)) {
        children = name.map((compName, i) => {
          const Snippet = snippetFn(compName);

          return <Snippet />;
        });

        Wrapper = _.isString(wrapper) && snippetFn(wrapper);
      } else {
        Component = snippetFn(name);
      }
    } catch (err) {
      const [lastSnippet] = this.snippets.slice(-1);
      throw new Error(`No React snippet ${lastSnippet} on assemble context: ${err.message}`);
    }

    try {
      let comp;

      if (Wrapper) {
        children = Component ? <Component /> : children;

        comp = (
          <Wrapper
            reactor={reactor}
            {...rest}
            >
            {children}
          </Wrapper>
        );
      } else if (_.isFunction(wrapper)) {
        Wrapper = wrapper(children || Component);

        comp = <Wrapper reactor={reactor} {...rest} />;
      } else {
        comp = <Component reactor={reactor} {...rest} />;
      }

      template = ReactDOMServer.renderToString(comp);
    } catch (err) {
      throw new Error(`Error compiling ${snippetName} on assemble context: ${err.message}`);
    }

    return new nunjucks.runtime.SafeString(template);
  }
}
