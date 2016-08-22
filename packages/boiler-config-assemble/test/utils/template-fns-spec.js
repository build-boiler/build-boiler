import {expect} from 'chai';
import path from 'path';
import makeConfig from '../../../boiler-config-base';
import makeFns from '../../src/utils/template-fns';

describe('#templateFns', () => {
  const config = makeConfig(
    path.join(process.cwd(), 'boiler.config.js')
  );

  describe('without a branch', () => {
    const branch = 'bloop';
    const fns = makeFns(config, {branch});
    const {join} = fns;
    const {addbase: base} = config.utils;
    const {srcDir, scriptDir, templateDir} = config.sources;
    const srcPath = path.join(srcDir, branch);

    it('should return the object of funcitons', () => {
      expect(fns).to.have.all.keys(
        'join',
        'headScripts',
        'layouts',
        'partials',
        'macros'
      );
    });

    it('should make the paths with templating function', () => {
      const fp = 'bleep';

      expect(fns.headScripts(fp)).to.equal(
        path.join(srcPath, scriptDir, 'head-scripts', `${fp}.js`)
      );
      expect(fns.layouts(fp)).to.equal(
        base(srcPath, templateDir, 'layouts', `${fp}.html`)
      );
      expect(fns.macros(fp)).to.equal(
        base(srcPath, templateDir, 'macros', `${fp}.html`)
      );
      expect(fns.partials(fp)).to.equal(
        base(srcPath, templateDir, 'partials', `${fp}.html`)
      );
    });

    it('should join strings', () => {
      const fp1 = 'bleep';
      const fp2 = 'bloop';

      expect(join(fp1, fp2)).to.equal(
        path.join(fp1, fp2)
      );
    });

    it('should join strings and numbers', () => {
      const fp1 = 'bleep';
      const fp2 = 2;

      expect(join(fp1, fp2)).to.equal(
        path.join(fp1, '2')
      );
    });

    it('should throw for undefined values', () => {
      const fp1 = 'bleep';
      let fp2;

      expect(join.bind(null, fp1, fp2)).to.throw(Error);
    });
  });

  describe('with a branch', () => {
    const fns = makeFns(config);
    const {addbase: base} = config.utils;
    const {srcDir, scriptDir, templateDir} = config.sources;

    it('should make the paths with templating function', () => {
      const fp = 'bleep';

      expect(fns.headScripts(fp)).to.equal(
        path.join(srcDir, scriptDir, 'head-scripts', `${fp}.js`)
      );
      expect(fns.layouts(fp)).to.equal(
        base(srcDir, templateDir, 'layouts', `${fp}.html`)
      );
      expect(fns.macros(fp)).to.equal(
        base(srcDir, templateDir, 'macros', `${fp}.html`)
      );
      expect(fns.partials(fp)).to.equal(
        base(srcDir, templateDir, 'partials', `${fp}.html`)
      );
    });
  });
});
