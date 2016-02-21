import {expect} from 'chai';
import sinon from 'sinon';

describe('a sample spec', () => {
  it('should work', () => {
    expect(true).to.be.true;
  });

  it('should get the global sinon', () => {
    expect(sinon.spy).to.be.a('function');
  });
});

