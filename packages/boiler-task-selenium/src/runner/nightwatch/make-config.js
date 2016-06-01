// Libraries
import merge from 'lodash/merge';


export const nightwatchDefaults = {
  globals: {
    waitForConditionTimeout: 10000
  },
  output_folder: false,
  selenium_port: 4444,
  selenium_host: 'localhost',
  silent: true,
  screenshots: {
    enabled: false,
    path: ''
  },
  launch_url: '/',
  desiredCapabilities: {
    javascriptEnabled: true,
    acceptSslCerts: true
  }
};

export default function makeNightwatchConfig(testConfig = {}) {
  return merge({}, nightwatchDefaults, testConfig);
}
