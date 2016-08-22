import {expect} from 'chai';
import path from 'path';
import cheerio from 'cheerio';
import {removeEndSlashes} from 'boiler-utils';
import render from '../config/nunjucks-tag-setup';
import GetAsset from '../../src/tags/get-asset';
import makeConfig from '../../../../test/config/make-mock-config';
import getStats from '../../../boiler-config-assemble/src/parse-assets';

describe('Nunjucks Tag {% get_asset %}', () => {
  const extensions = {
    getAsset: new GetAsset()
  };
  const opts = {
    extensions
  };
  const sources = {
    statsDir: path.resolve(__dirname, '..', 'mocks', 'webpack-stats').replace(process.cwd(), '')
  };
  const environment = {
    isDev: false
  };
  const config = makeConfig({sources, environment});
  const {srcDir, templateDir} = config.sources;
  const view = {
    path: config.utils.addbase(srcDir, templateDir, 'pages', 'index.html')
  };
  const ctx = {
    environment: config.environment,
    sources: config.sources,
    view
  };
  let mainCss, vendorsJs, pageJs, assets;

  before(async () => {
    assets = await getStats(config);

    Object.assign(ctx, {assets});

    vendorsJs = assets.javascript.vendors;
    pageJs = assets.javascript['pages/main'];
    mainCss = assets.styles.global;
  });

  it('should work for subresource integrity for CSS', async () => {
    const tag = await render(
      `{% get_asset type="css",integrity=true %}`,
      ctx,
      opts
    );
    const $ = cheerio.load(tag);
    const links = $('link').toArray();
    const [link] = links;
    const {attribs} = link;

    expect(links.length).to.equal(1);
    expect(attribs).to.have.all.keys(['href', 'rel', 'integrity', 'crossorigin']);

    expect(attribs.href).to.equal(mainCss);
    expect(attribs.integrity).to.equal(assets.integrity[removeEndSlashes(mainCss)]);
  });

  it('should work for subresource integrity for JS', async () => {
    const tag = await render(
      `{% get_asset type="js",integrity=true %}`,
      ctx,
      opts
    );

    const $ = cheerio.load(tag);
    const scripts = $('script').toArray();
    const [vendorScript, pageScript] = scripts;

    expect(scripts.length).to.equal(2);
    expect(vendorScript.attribs).to.have.all.keys(['src', 'type', 'integrity', 'crossorigin']);
    expect(pageScript.attribs).to.have.all.keys(['src', 'type', 'integrity', 'crossorigin']);

    expect(vendorScript.attribs.src).to.equal(vendorsJs);
    expect(vendorScript.attribs.integrity).to.equal(assets.integrity[removeEndSlashes(vendorsJs)]);

    expect(pageScript.attribs.src).to.equal(pageJs);
    expect(pageScript.attribs.integrity).to.equal(assets.integrity[removeEndSlashes(pageJs)]);
  });
});
