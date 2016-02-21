import {expect} from 'chai';
import setup from '../config/e2e-setup';

describe('#SampleGenerator not exporting ANY browsers', () => {
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
