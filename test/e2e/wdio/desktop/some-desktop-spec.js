import {expect} from 'chai';

// Just here to make sure the Babel class properties can be transformed!
class Whatever {
  static whatever = 'puppies';
}

function wait(delay = 500, counter = 0) {
  try {
    return new Promise((res) => setTimeout(res.bind(null, counter += delay), delay));
  } catch (e) {
    global.console.log(e);
  }
}

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

  it('should be able to execute an asynchronous function', () => {
    client.waitUntil(async () => {
      await wait(5000);
      return true;
    });
  });
});
