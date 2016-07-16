import {expect} from 'chai';

// This test exists solely to to make sure the explicit `export default` works for browsers
export default {
  desktop: ['chrome', 'firefox', 'safari', 'ie']
};

describe('whatever', () => {
  it('should verify a tautology', () => {
    expect(true).to.be.true;
  });
});
