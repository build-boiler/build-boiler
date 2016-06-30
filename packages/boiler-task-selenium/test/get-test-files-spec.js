// Libraries
import Immutable from 'immutable';
import {expect} from 'chai';
// Helpers
import makeMockConfig from './config/make-mock-config';
import getTestFiles, {makeSpecsGlob} from '../src/get-test-files';


const baseSpecDir = 'test/e2e/wdio';
const runnerOptions = { specsDir: baseSpecDir };
describe(`#makeSpecsGlob`, () => {
  it(`should return a generic spec glob if both 'desktop' and 'mobile' are specified`, () => {
    const config = makeMockConfig({desktop: true, mobile: true});
    expect(makeSpecsGlob(config, runnerOptions)).to.equal(`${baseSpecDir}/**/*-spec.js`);
  });

  it(`should return a generic spec glob if neither 'desktop' nor 'mobile' is specified`, () => {
    const config = makeMockConfig();
    expect(makeSpecsGlob(config, runnerOptions)).to.equal(`${baseSpecDir}/**/*-spec.js`);
  });

  it(`should return a desktop spec glob if only 'desktop' is specified`, () => {
    const config = makeMockConfig({desktop: true});
    expect(makeSpecsGlob(config, runnerOptions)).to.equal(`${baseSpecDir}/{desktop/**/,,!(mobile)/**/}*-spec.js`);
  });

  it(`should return a mobile spec glob if only 'mobile' is specified`, () => {
    const config = makeMockConfig({mobile: true});
    expect(makeSpecsGlob(config, runnerOptions)).to.equal(`${baseSpecDir}/{mobile/**/,,!(desktop)/**/}*-spec.js`);
  });

  it(`should return a file-specific glob if a file is specified with no platforms`, () => {
    const file = 'whatever-spec';
    const config = makeMockConfig({file});
    expect(makeSpecsGlob(config, runnerOptions)).to.equal(`${baseSpecDir}/**/${file}.js`);
  });

  it(`should return a file-specific glob if a file is specified with desktop`, () => {
    const file = 'whatever-spec';
    const config = makeMockConfig({file, desktop: true});
    expect(makeSpecsGlob(config, runnerOptions)).to.equal(`${baseSpecDir}/{desktop/**/,,!(mobile)/**/}${file}.js`);
  });
});


describe(`#getTestFiles`, () => {
  function compareMaps(mapA, mapB) {
    expect(JSON.stringify(mapA.toJSON())).to.equal(JSON.stringify(mapB.toJSON()));
  }

  function getTests(...tests) {
    return [].concat.apply(Array.prototype, tests).sort();
  }

  const generalTests = [
    'test/e2e/wdio/sample-spec.js',
    'test/e2e/wdio/some-dir/some-spec.js'
  ];
  const desktopTests = generalTests.concat([
    'test/e2e/wdio/desktop/some-desktop-spec.js',
    'test/e2e/wdio/desktop/wait-desktop-spec.js',
  ]).sort();
  const mobileTests = generalTests.concat([
    'test/e2e/wdio/mobile/some-mobile-spec.js'
  ]).sort();
  const tunnelTests = [
    'test/e2e/wdio/desktop/all-browsers-spec.js'
  ];

  it(`should use the exported browsers if they're provided`, () => {
    const config = makeMockConfig({desktop: true, mobile: true});
    const suite = getTestFiles(config, runnerOptions);
    compareMaps(suite, new Map([
      [['chrome', 'firefox'], getTests(desktopTests, tunnelTests)],
      [['safari', 'ie'], tunnelTests],
      [['iphone', 'android'], mobileTests]
    ]));
  });

  it(`should use the all desktop browsers if 'desktop' is true`, () => {
    const config = makeMockConfig({desktop: true});
    const suite = getTestFiles(config, runnerOptions);
    compareMaps(suite, new Map([
      [['chrome', 'firefox'], getTests(desktopTests, tunnelTests)],
      [['safari', 'ie'], tunnelTests]
    ]));
  });

  it(`should use the all mobile browsers if 'mobile' is true`, () => {
    const config = makeMockConfig({mobile: true});
    const suite = getTestFiles(config, runnerOptions);
    compareMaps(suite, new Map([
      [['iphone', 'android'], mobileTests]
    ]));
  });

  it(`should use the specified CLI browsers if 'desktop' is a list of browsers`, () => {
    const config = makeMockConfig({desktop: ['safari', 'ie']});
    const suite = getTestFiles(config, runnerOptions);
    compareMaps(suite, new Map([
      [['safari', 'ie'], getTests(desktopTests, tunnelTests)],
    ]));
  });

  it(`should use the specified CLI browsers if 'mobile' is a list of browsers`, () => {
    const config = makeMockConfig({mobile: ['iphone']});
    const suite = getTestFiles(config, runnerOptions);
    compareMaps(suite, new Map([
      [['iphone'], mobileTests]
    ]));
  });

  it(`should override the exported browsers with CLI browsers`, () => {
    const config = makeMockConfig({desktop: ['chrome']});
    const suite = getTestFiles(config, runnerOptions);
    compareMaps(suite, new Map([
      [['chrome'], getTests(desktopTests, tunnelTests)]
    ]));
  });
});
