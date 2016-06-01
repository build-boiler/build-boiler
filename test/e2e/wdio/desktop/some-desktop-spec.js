import {expect} from 'chai';


describe('Desktop Directory Spec', () => {
  const client = global.browser;
  const url = '/';

  before(() => {
    return client.url(url);
  });

  it('should get the page title', () => {
    const title = client.getTitle();
    expect(title).to.eq('Build Boiler');
  });

  it('should get a div from the DOM', () => {
    const elm = client.element('body');
    expect(elm).to.not.be.null;
  });

  it('should fill in the inputs', () => {
    ['givenName', 'lastName', 'whatever'].forEach((fieldName) => {
      client.element(`[name="${fieldName}"]`).setValue(fieldName);
    });
  });
});
