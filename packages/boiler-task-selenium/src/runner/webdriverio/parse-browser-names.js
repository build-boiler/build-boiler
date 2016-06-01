// Packages
import boilerUtils from 'boiler-utils';


/**
 * Parse capabilities for browser/device names to be logged
 * @param {Object} opts test config
 * @return {Object} joined browser/device names and spec file names
 */
export default function(opts) {
  const {renameKey} = boilerUtils;
  const browsers = opts.capabilities.map(caps => caps.device || caps.browserName).join(', ');
  const specs = opts.specs.filter(spec => !/\/config\//.test(spec)).map(renameKey).join(', ');

  return {
    browsers,
    specs
  };
}
