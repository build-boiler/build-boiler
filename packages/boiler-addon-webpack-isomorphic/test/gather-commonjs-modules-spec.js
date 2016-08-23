import {expect} from 'chai';
import rewire from 'rewire';
import sinon from 'sinon';
import {dynamicRequire} from 'boiler-utils';

describe('#gatherCommonjsModules', () => {
  const gatherMod = rewire('../src/utils/gather-commonjs-modules');
  const oldRequire = gatherMod.__get__('require');
  const gather = dynamicRequire(gatherMod);

  before(() => {
    const mock = (fp) => require(fp);

    mock.resolve = function(fp) {
      //TODO: test recursively excluding modules from included modules
      //ie. an included dependency that we want to make it's deps external
      //if (/@hfa/.test(fp)) {
        //throw new Error('not found');
      //}

      return fp;
    };

    gatherMod.__set__('require', mock);
  });

  after(() => {
    gatherMod.__set__('require', oldRequire);
    require.resolve = oldRequire;
  });

  const pkg = {
    dependencies: {
      '.bin': 'bloop',
      '@hfa/async-user-data': '^1.0.0',
      '@hfa/boiler-config-hfa': '^0.3.0',
      '@hfa/bs-tunnel': '^0.1.2',
      '@hfa/eslint-config': '0.10.1',
      'async': '^2.0.0-rc.1',
      'babel-core': '^6.5.2',
      'babel-eslint': '^5.0.0',
      'babel-plugin-add-module-exports': '^0.1.1',
      'babel-plugin-transform-decorators-legacy': '^1.2.0',
      'babel-plugin-typecheck': '^3.5.1',
      'babel-polyfill': '^6.3.14',
      'babel-preset-es2015': '^6.1.18',
      'babel-preset-react': '^6.1.18',
      'babel-preset-stage-0': '^6.1.18',
      'babel-register': '^6.3.13',
      'chai': '^3.5.0',
      'deps': '^0.1.2',
      'eslint': '^1.10.3',
      'eslint-config': '0.3.0-legacy',
      'eslint-friendly-formatter': '^1.2.2',
      'eslint-plugin-react': '^3.16.1',
      'fs-extra': '^0.26.5',
      'gulp': '^3.9.1',
      'gulp-babel': '^6.1.2',
      'gulp-eslint': '^1.1.1',
      'gulp-if': '^2.0.0',
      'gulp-load-plugins': '^1.2.0',
      'gulp-mocha': '^2.2.0',
      'gulp-newer': '^1.1.0',
      'gulp-plumber': '^1.1.0',
      'gulp-util': '^3.0.7',
      'gutil': '^1.6.4'
    }
  };
  const {dependencies} = pkg;
  const pkgKeys = Object.keys(dependencies);
  const hfaKeys = pkgKeys.filter(key => /@hfa/.test(key));
  const eslintKeys = pkgKeys.filter(key => /eslint/.test(key));
  const include = hfaKeys;
  const exclude = eslintKeys;
  const config = {
    pkg
  };

  it('should exclude everything in package.json if no modules are specified', () => {
    const externals = gather(config);
    expect(externals).to.have.all.keys(pkgKeys.filter(key => key !== '.bin'));
  });

  it('should exclude the blacklist to externals', () => {
    const externals = gather({
      ...config,
      isomorphic: {
        modules: {
          exclude
        }
      }
    });
    expect(externals).to.have.all.keys(eslintKeys);
  });

  it('if include is specified it should omit the includes from externals', () => {
    const externals = gather({
      ...config,
      isomorphic: {
        modules: {
          include
        }
      }
    });
    const filteredKeys = pkgKeys.filter(key => !/@hfa/.test(key) && key !== '.bin');

    expect(externals).to.have.all.keys(filteredKeys);
  });
});
