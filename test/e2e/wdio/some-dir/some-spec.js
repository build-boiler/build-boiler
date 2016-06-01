import {expect} from 'chai';


describe('Nested Directory Spec', () => {
  const client = global.browser;
  const url = '/';

  before(() => {
    return client.url(url);
  });

  it('should get the page title', () => {
    const title = client.getTitle();

    expect(title).to.eq('Build Boiler');
  });
});
