import path from 'path';
import nunjucks from 'nunjucks';
import boilerUtils from 'boiler-utils';
import isString from 'lodash/isString';
import isBoolean from 'lodash/isBoolean';

const {
  renameKey,
  removeEndSlashes
} = boilerUtils;

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

    return this.addIntegrity(`<script ${type} src="${src}"></script>`, src);
  }

  addScript({vendors, main, page}) {
    const list = [];

    vendors && list.push(this.script(vendors));
    main && list.push(this.script(main));
    page && list.push(this.script(page));

    return list.join('\n');
  }

  addLink({main, global, isDev, src}) {
    const rel = 'rel="stylesheet"';
    const makeLink = (src) => {
      return this.addIntegrity(`<link ${rel} href="${src}">\n`, src);
    };
    const linkTag = makeLink(src || global);
    let styles = '';

    if (!src) {
      if (isDev) {
        styles = main ? Object.keys(main).reduce((str, fp) => {
          const ext = path.extname(fp);

          if (ext === '.css' || ext === '.scss') {
            const val = main[fp]._style;

            str += val;
          }

          return str;
        }, '') : '';

        styles = `\n<style>\n${styles}\n</style>\n`;
      } else {
        styles = Object.keys(main).reduce((str, key) => {
          const src = main[key];

          return str + makeLink(src);
        }, '');
      }
    }

    return linkTag + styles;
  }

  addIntegrity(tag, fp) {
    if (this.integrity) {
      const re = /<((script|link).+?)>/;
      const split = fp.split(path.sep).filter(dir => !!dir);
      const typeI = split.indexOf(this.type);
      const src = typeI !== -1 ? split.slice(typeI) : split;
      const hash =
        this.integrity[removeEndSlashes(fp)] || //remove preceding slash to match keys in 'subresource-integrity-*.json'
        this.integrity[src.join(path.sep)]; //case for '{css,js}/{**/,}<filename>-<hash>.{css,js}'
      const attrs = [
        `integrity="${hash}"`
      ];

      if (this.cors) {
        attrs.push(
          `crossorigin="${this.cors}"`
        );
      }

      return hash ? tag.replace(re, `<$1 ${attrs.join(' ')}>`) : tag;
    }

    return tag;
  }

  run(context, args) {
    const {ctx} = context;
    const {
      assets = {},
      environment,
      sources,
      view
    } = ctx;
    const {globalBundleName} = sources;
    const {
      integrity: integrityData,
      javascript = {},
      styles = {}
    } = assets;
    const {isDev} = environment;
    const {path: viewPath} = view;
    const {type, version = '1.0.0', integrity, cors = true} = args;
    const pageKey = renameKey(viewPath, 'main');
    const pageBundle = javascript[pageKey];
    let tag;

    if (!isDev && integrity && integrityData) {
      this.integrity = integrityData;

      if (isString(cors)) {
        this.cors = cors;
      } else if (isBoolean(cors) && cors) {
        this.cors = 'anonymous';
      }
    }

    this.type = type; //used in the `addIntegrity` method

    switch (type) {
      case 'pantsuit':
        tag = this.addLink({
          src: `https://a.hrc.onl/pantsuit/v${version}/css/pantsuit.css`
        });
        break;
      case 'css':
        const main = !isDev ? Object.keys(styles).reduce((acc, key) => {
          if (key === 'main' || key === 'vendors' || key === pageKey) {
            acc[key] = styles[key];
          }

          return acc;
        }, {}) : assets.assets;

        tag = this.addLink({
          main,
          global: styles[globalBundleName],
          isDev
        });
        break;
      case 'js':
        tag = this.addScript({
          vendors: javascript.vendors,
          main: javascript.main,
          page: pageBundle
        });
        break;
    }

    return new nunjucks.runtime.SafeString(tag || '');
  }
}
