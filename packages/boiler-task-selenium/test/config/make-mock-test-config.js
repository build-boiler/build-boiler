// Libraries
import merge from 'lodash/merge';
// Mocks
import wdioConfig from '../mocks/wdio.config';
import nightwatchConfig from '../mocks/nightwatch.config';


export default function makeMockTestConfig(mixin = {}) {
  const {runner} = mixin;
  const baseConfig = runner === 'nightwatch' ? nightwatchConfig : wdioConfig;
  return merge({}, baseConfig, mixin);
}
