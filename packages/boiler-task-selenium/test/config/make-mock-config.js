// Libraries
import path from 'path';
import merge from 'lodash/merge';
// Packages
import boilerUtils from 'boiler-utils';


const {gulpTaskUtils} = boilerUtils;
const {addbase} = gulpTaskUtils;
const buildBase = addbase()();
export default function(mixin = {}) {
  const makeConfig = require(`${buildBase}/packages/boiler-config-base/src/index`);
  const mockPath = path.resolve(__dirname, '..', 'mocks');
  const config = makeConfig(path.join(mockPath, 'boiler.config.js'));
  return merge({}, config, mixin);
}
