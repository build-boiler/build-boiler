import {expect} from 'chai';
import setup from '../../config/e2e-setup';

describe('Desktop Directory Spec', () => {
  const client = setup();
  const url = '/';

  before(() => {
    return client.url(url);
  });

  it('should wait for three seconds', () => {
    client.pause(3000);
  });

  it('should make sure that all fields are still blank', () => {
    ['givenName', 'lastName', 'whatever'].forEach((fieldName) => {
      expect(client.element(`[name="${fieldName}"]`).getValue()).to.equal('');
    });
  });
});
