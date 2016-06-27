// Libraries
import path from 'path';
import merge from 'lodash/merge';
import makeConfig from '../../../boiler-config-base/src/index';

export default function(mixin = {}) {
  const mockPath = path.resolve(__dirname, '..', 'mocks');
  const config = makeConfig(path.join(mockPath, 'boiler.config.js'));
  const environment = {
    branch: undefined,
    isMaster: false,
    isDevRoot: false
  };

  Object.assign(config, {environment}, {file: undefined});

  return merge({}, config, mixin);
}
