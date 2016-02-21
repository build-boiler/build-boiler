import {expect} from 'chai';
import setup from '../config/e2e-setup';


const url = '/';

describe('#SampleGenerator not exporting ANY browsers', () => {
  let client;

  before(function() {
    client = setup();
    return client.url(url);
  });

  it('should get the page title', function *() {
    //be a hipster and use generators
    const title = yield client.getTitle();

    expect(title).to.eq('FrontendBoilerplate');
  });
});

/**
 * If you don't export any browsers/devices
 * "defaults" will be exported for you behind the scenes
 *
 * {
 *   desktop: ['chrome', 'firefox'],
 *   mobile: ['iphone']
 * }
 */
