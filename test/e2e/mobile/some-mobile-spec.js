import {expect} from 'chai';
import setup from '../../config/e2e-setup';

describe('Mobile Directory Spec', () => {
  const client = setup();
  const url = '/';

  before(async () => {
    return await client.url(url);
  });

  it('should get the page title', async () => {
    const title = await client.getTitle();

    expect(title).to.eq('Build Boiler');
  });
});
