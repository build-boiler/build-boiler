import {expect} from 'chai';
import setup from '../config/e2e-setup';

const url = '/';

describe('#SamplePromise', () => {
  let client;

  before(() => {
    client = setup();
    return client.url(url);
  });

  it('should get the page title', (done) => {
    //use a promise and `call` the `done` function at the end
    return client.getTitle().then((title) => {
      expect(title).to.eq('FrontendBoilerplate');
    }).call(done);
  });
});

export default {
  desktop: [
    'chrome',
    'firefox'
  ],
  mobile: ['iphone']
};


