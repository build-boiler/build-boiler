import {expect} from 'chai';
import removeSlashes from '../src/remove-end-slashes';

describe('#removeEndSlashes()', () => {
  it('should return the original path if it is of length 1', () => {
    const fp = removeSlashes('/');
    expect(fp).to.equal('/');
  });

  it('should remove a leading slash', () => {
    const fp = removeSlashes('/bleep/bloop/bloosh/what');
    expect(fp).to.equal('bleep/bloop/bloosh/what');
  });

  it('should remove leading and trailing slash', () => {
    const fp = removeSlashes('/bleep/bloop/bloosh/what/');
    expect(fp).to.equal('bleep/bloop/bloosh/what');
  });
});

