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

  it('should fill in the inputs', () => {
    ['givenName', 'lastName', 'whatever'].forEach((fieldName) => {
      client.element(`[name="${fieldName}"]`).setValue(fieldName);
    });
  });
});
