// Libraries
import {expect} from 'chai';
// Helpers
import makeMockConfig from './config/make-mock-config';
import getCapabilities from '../src/get-capabilities';


describe(`#getCapabilities()`, () => {
  it('should return the correct capabilities for chrome', () => {
    const config = makeMockConfig({
      desktop: ['chrome']
    });

    expect(getCapabilities(config)).to.deep.equals({
      testEnv: 'local',
      testConfig: [{
        baseUrl: 'http://localhost:8000',
        logLevel: 'silent',
        specs: [
          'test/e2e/nightwatch/desktop/some-desktop-spec.js',
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

  it('should return the correct capabilities for firefox', () => {
    const config = makeMockConfig({
      desktop: ['firefox']
    });

    expect(getCapabilities(config)).to.deep.equals({
      testEnv: 'local',
      testConfig: [{
        baseUrl: 'http://localhost:8000',
        logLevel: 'silent',
        specs: [
          'test/e2e/nightwatch/desktop/some-desktop-spec.js',
          'test/e2e/wdio/desktop/some-desktop-spec.js',
          'test/e2e/wdio/desktop/wait-desktop-spec.js',
          'test/e2e/wdio/sample-spec.js',
          'test/e2e/wdio/some-dir/some-spec.js'
        ],
        capabilities: [{
          browserName: 'firefox'
        }]
      }]
    });
  });

  it('should return the correct capabilities for chrome and firefox', () => {
    const config = makeMockConfig({
      desktop: ['chrome', 'firefox']
    });

    expect(getCapabilities(config)).to.deep.equals({
      testEnv: 'local',
      testConfig: [{
        baseUrl: 'http://localhost:8000',
        logLevel: 'silent',
        specs: [
          'test/e2e/nightwatch/desktop/some-desktop-spec.js',
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
});
