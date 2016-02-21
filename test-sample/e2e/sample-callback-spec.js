import {expect} from 'chai';
import setup from '../config/e2e-setup';

const url = '/';

describe('#SampleCallback', () => {
  let client;

  before((done) => {
    client = setup();
    client.url(url).call(done);
  });

  it('should get the page title', (done) => {
    //use a callback
    client.getTitle((err, title) => {
      expect(title).to.eq('FrontendBoilerplate');
      done(err);
    });
  });
});

export default {
  desktop: [
    'chrome',
    'firefox'
  ],
  mobile: [
    'iphone',
    'galaxy'
  ]
};
