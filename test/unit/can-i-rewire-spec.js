import {expect} from 'chai';
import rewireMock from './mocks/rewire-mock';

describe('#rewireMock', () => {
  const args = ['bleep', 'bloop'];

  describe('rewiring', () => {
    beforeEach(() => {
      rewireMock.__Rewire__('logger', (...args) => {
        return ['rewired:', ...args].join(' ');
      });
    });

    afterEach(() => {
      rewireMock.__ResetDependency__('logger');
    });

    it('should rewire', () => {
      expect(rewireMock(...args)).to.equal(
        ['rewired:', ...args].join(' ')
      );
    });
  });

  describe('not rewiring', () => {
    it('should not rewire', () => {
      expect(rewireMock(...args)).to.equal(
        ['not rewired:', ...args].join(' ')
      );
    });
  });
});
