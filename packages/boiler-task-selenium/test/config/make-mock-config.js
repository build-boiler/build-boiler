// Libraries
import path from 'path';
import merge from 'lodash/merge';


export default function(mixin = {}) {
  const makeConfig = require(path.join(process.cwd(), 'packages/boiler-config-base/src/index'));
  const mockPath = path.resolve(__dirname, '..', 'mocks');
  const config = makeConfig(path.join(mockPath, 'boiler.config.js'));
  return merge({}, config, mixin);
}
