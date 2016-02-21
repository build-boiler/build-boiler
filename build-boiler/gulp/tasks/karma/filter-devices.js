import _ from 'lodash';
import bsBrowsers from './browser-stack/browsers';
import bsDevices from './browser-stack/devices.js';

/**
 * Compares CLI desired devices to the configs in `/browser-stack` directory
 * @param {Array} desiredDevices
 * @return {Array} found devices based on CLI config
 */
export function filterKeys(desiredDevices) {
  const allBsDevices = _.assign({}, bsBrowsers, bsDevices);

  return desiredDevices.reduce((list, cliDevice) => {
    const foundDevice = Object.keys(allBsDevices).filter(bsDevice => {
      const {browser, device} = allBsDevices[bsDevice];
      const compare = browser || device;

      return compare.toLowerCase().indexOf(cliDevice) !== -1;
    });

    return [...list, ...foundDevice];
  }, []);
}

/**
 * Filter CLI args for BrowserSync browser/devices
 * @param {Object} opts
 * @param {Array|Boolean} desktop
 * @param {Array|Boolean} mobile
 * @return {Array}
 */
export default function({desktop, mobile}) {
  const nothingSpecified = _.isUndefined(desktop) && _.isUndefined(mobile);
  const browserKeys = Object.keys(bsBrowsers);
  const deviceKeys = Object.keys(bsDevices);
  let browsers = [];
  let devices = [];

  if (desktop) {
    browsers = _.isArray(desktop) ? filterKeys(desktop) : browserKeys;
  }

  if (mobile) {
    devices = _.isArray(mobile) ? filterKeys(mobile) : deviceKeys;
  }

  if (nothingSpecified) {
    browsers = browserKeys;
    devices = deviceKeys;
  }

  return [...browsers, ...devices];
}
