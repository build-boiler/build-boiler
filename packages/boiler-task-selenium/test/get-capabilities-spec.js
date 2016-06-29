// Libraries
import reduce from 'lodash/reduce';
import {expect} from 'chai';
// Helpers
import makeMockConfig from './config/make-mock-config';
import makeMockTestConfig from './config/make-mock-test-config';
import getCapabilities from '../src/get-capabilities';


const bsConfig = {
  BROWSERSTACK_USERNAME: 'blah',
  BROWSERSTACK_API: '2016',
  localIdentifier: 'whatever'
};
describe(`#getCapabilities()`, () => {
  it('should return the correct WebdriverIO capabilities for chrome', () => {
    const runnerOptions = makeMockTestConfig({runner: 'wdio'});
    const config = makeMockConfig({ desktop: ['chrome'] });

    expect(getCapabilities(config, runnerOptions)).to.deep.equals({
      testEnv: 'local',
      testConfig: [{
        baseUrl: 'http://localhost:8000',
        logLevel: 'silent',
        specs: [
          'test/e2e/wdio/desktop/all-browsers-spec.js',
          'test/e2e/wdio/desktop/some-desktop-spec.js',
          'test/e2e/wdio/desktop/wait-desktop-spec.js',
          'test/e2e/wdio/sample-spec.js',
          'test/e2e/wdio/some-dir/some-spec.js'
        ],
        capabilities: [{
          browserName: 'chrome'
        }]
      }]
    });
  });

  it('should return the correct WebdriverIO capabilities for chrome and firefox', () => {
    const runnerOptions = makeMockTestConfig({runner: 'wdio'});
    const config = makeMockConfig({ desktop: ['chrome', 'firefox'] });

    expect(getCapabilities(config, runnerOptions)).to.deep.equals({
      testEnv: 'local',
      testConfig: [{
        baseUrl: 'http://localhost:8000',
        logLevel: 'silent',
        specs: [
          'test/e2e/wdio/desktop/all-browsers-spec.js',
          'test/e2e/wdio/desktop/some-desktop-spec.js',
          'test/e2e/wdio/desktop/wait-desktop-spec.js',
          'test/e2e/wdio/sample-spec.js',
          'test/e2e/wdio/some-dir/some-spec.js'
        ],
        capabilities: [{
          browserName: 'chrome'
        }, {
          browserName: 'firefox'
        }]
      }]
    });
  });

  it('should return the correct Nightwatch capabilities for chrome and firefox', () => {
    const runnerOptions = makeMockTestConfig({runner: 'nightwatch'});
    const config = makeMockConfig({ desktop: ['chrome', 'firefox'] });

    expect(getCapabilities(config, runnerOptions)).to.deep.equals({
      testEnv: 'local',
      testConfig: [{
        baseUrl: 'http://localhost:8000',
        logLevel: 'silent',
        specs: [
          'test/e2e/nightwatch/desktop/some-desktop-spec.js'
        ],
        capabilities: [{
          browserName: 'chrome'
        }, {
          browserName: 'firefox'
        }]
      }]
    });
  });

  const mobileVariations = [{
    browserName: 'iPhone6',
    browser_version: '8.0',
    device: 'iPhone 6'
  }, {
    browserName: 'iPhone6S',
    browser_version: '9.0',
    device: 'iPhone 6S'
  }, {
    browserName: 'android',
    device: 'Samsung Galaxy S5',
    platform: 'ANDROID'
  }];
  const mobileCaps = reduce(mobileVariations, (acc, obj) => {
    acc.push({
      'browserstack.debug': 'true',
      'browserstack.local': 'true',
      'browserstack.localIdentifier': bsConfig.localIdentifier,
      build: 'build-boiler',
      platform: 'MAC',
      project: 'v1.0.0 [local:e2e]',
      name: obj.device,
      ...obj
    });
    return acc;
  }, []);

  it('should return the correct WebdriverIO capabilities for mobile', () => {
    const runnerOptions = makeMockTestConfig({runner: 'wdio'});
    const config = makeMockConfig({mobile: ['iphone', 'android'], bsConfig});

    expect(getCapabilities(config, runnerOptions)).to.deep.equals({
      testEnv: 'tunnel',
      testConfig: [{
        baseUrl: 'http://localhost:8000',
        logLevel: 'silent',
        specs: [
          'test/e2e/wdio/mobile/some-mobile-spec.js',
          'test/e2e/wdio/sample-spec.js',
          'test/e2e/wdio/some-dir/some-spec.js'
        ],
        capabilities: mobileCaps,
        user: bsConfig.BROWSERSTACK_USERNAME,
        key: bsConfig.BROWSERSTACK_API,
        host: 'hub.browserstack.com',
        port: 80
      }]
    });
  });

  it('should return the correct Nightwatch capabilities for mobile', () => {
    const runnerOptions = makeMockTestConfig({runner: 'nightwatch'});
    const config = makeMockConfig({mobile: ['iphone', 'android'], bsConfig});

    expect(getCapabilities(config, runnerOptions)).to.deep.equals({
      testEnv: 'tunnel',
      testConfig: [{
        baseUrl: 'http://localhost:8000',
        logLevel: 'silent',
        specs: [
          'test/e2e/nightwatch/mobile/some-mobile-spec.js'
        ],
        capabilities: mobileCaps,
        user: bsConfig.BROWSERSTACK_USERNAME,
        key: bsConfig.BROWSERSTACK_API,
        host: 'hub.browserstack.com',
        port: 80
      }]
    });
  });

  it(`should use the value of 'devUrl' if it's a string on Travis`, () => {
    const url = 'http://razzamatazz.biz';
    const branch = 'whatever-branch';
    const runnerOptions = makeMockTestConfig({ devUrl: url });
    const config = makeMockConfig({
      desktop: ['chrome'],
      environment: {
        branch
      },
      bsConfig
    });

    const caps = getCapabilities(config, runnerOptions);
    caps.testConfig.forEach((cap) => {
      expect(cap.baseUrl).to.equal('http://razzamatazz.biz/whatever-branch');
    });
  });

  it(`should use the return value of 'devUrl' if it's a function locally`, () => {
    const url = 'http://razzamatazz.biz';
    const runnerOptions = makeMockTestConfig({
      devUrl() {
        return url;
      }
    });
    const config = makeMockConfig({ desktop: ['chrome'] });

    const caps = getCapabilities(config, runnerOptions);
    caps.testConfig.forEach((cap) => {
      expect(cap.baseUrl).to.equal('http://razzamatazz.biz');
    });
  });

  it(`should use the return value of 'devUrl' if it's a function on Travis`, () => {
    const url = 'http://razzamatazz.biz';
    const branch = 'whatever-branch';
    const runnerOptions = makeMockTestConfig({
      devUrl() {
        return url;
      },
      environment: {
        branch
      },
    });
    const config = makeMockConfig({ desktop: ['chrome'] });

    const caps = getCapabilities(config, runnerOptions);
    caps.testConfig.forEach((cap) => {
      expect(cap.baseUrl).to.equal('http://razzamatazz.biz');
    });
  });
});
