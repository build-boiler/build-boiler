import setup from './e2e-setup';

describe('setup => this could take a while :-P', () => {

  before(function() {
    //increase the timeout for the first script
    //cannot use arrow function or `this` won't work
    this.timeout(40000);
    const client = setup();
    return client.url('/');
  });

  it('starts the webdriver session', () => {});
});

