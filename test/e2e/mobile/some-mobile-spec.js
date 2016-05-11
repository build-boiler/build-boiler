import {expect} from 'chai';
import setup from '../../config/e2e-setup';

describe('Mobile Directory Spec', () => {
  const client = setup();
  const url = '/';

  before(() => {
    client.url(url);
  });

  it('should get the page title', () => {
    const title = client.getTitle();
    expect(title).to.eq('Build Boiler');
  });

  // True test of synchronous commands!
  it('should get a div from the DOM', () => {
    const elm = client.element('body');
    expect(elm).to.not.be.null;
  });
});
