import setup from './e2e-setup';
/*eslint no-console: 0*/

describe('tear down', function() {
  const client = setup();

  after(async () => {
    try {
      await client.end();
      console.log('Successfully Ended Webriver Session');
      process.exit(0);
    } catch (err) {
      console.log('Error Ending Webriver Session', err.stack);
      process.exit(1);
    }
  });

  it('ends the webdriver session', () => {});
});
