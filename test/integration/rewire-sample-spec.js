import {expect} from 'chai';
import sinon from 'sinon';
import mock from './mocks/rewire-parent';

describe('rewire sample spec', () => {
  before(() => {
    mock.__Rewire__('child', {
      stuff() {
        return 'rewired stuff';
      },
      things() {
        return 'rewired things';
      }
    });
  });

  after(() => {
    mock.__ResetDependency__('child');
  });

  it('should rewire a module', () => {
    const rewiredStuff = mock.callStuff();
    const rewiredThings = mock.callThings();
    expect(rewiredStuff).to.equal('rewired stuff');
    expect(rewiredThings).to.equal('rewired things');
  });
});

