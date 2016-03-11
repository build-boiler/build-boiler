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
    const tok = parser.nextToken();
    const args = parser.parseSignature(null, true);

    if (args.children.length === 0) {
      args.addChild(new nodes.Literal(0, 0, ''));
    }

    parser.advanceAfterBlockEnd(tok.value);
    return new nodes.CallExtension(this, 'run', args);
  }

  getComponent(keys) {
    return (name) => {
      const replacement = /-?entry/;
      const replace = (str) => str.replace(replacement, '');
      const [snippetName] = keys.filter(key => {
        const dir = key.split('/')[0] || '';
        const base = path.basename(key) || '';
        const isDir = dir === name || replace(dir) === name;
        const isFile = base === name || replace(dir) === name;

        return isDir || isFile;
      });

      this.snippets.push(snippetName);

      return this.app.snippets.getView(`${snippetName}`).fn;
    };
  }

  run(context, args) {
    const {ctx} = context;
    const {isomorphic_data: isoData, environment} = ctx;
    const snippetKeys = Object.keys(this.app.views.snippets);
    const snippetFn = this.getComponent(snippetKeys);
    const {SafeString} = nunjucks.runtime;
    let props,
      name,
      wrapper,
      children,
      Component,
      Wrapper,
      snippetName,
      template;

    if (environment && environment.isDev) {
      //return early if wrong environment
      return new SafeString('');
    }

    if (_.isPlainObject(isoData)) {
      //use this if using an `include` or global context is available
      ({props} = ctx);
      ({name, wrapper} = isoData);
    } else {
      //use this if using a `macro` where global scope is not available
      ({name, props, wrapper} = args);
    }

    const {fluxStore: reactor, ...rest} = props;

    try {
      if (Array.isArray(name)) {
        children = name.map((compName, i) => {
          const Snippet = snippetFn(compName);

          return <Snippet />;
        });

      } else {
        Component = snippetFn(name);
      }

      if (_.isString(wrapper)) {
        try {
          Wrapper = snippetFn(wrapper);
        } catch (err) {
          wrapper = ctx[wrapper];
        }
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

    return new SafeString(template);
  }
}
