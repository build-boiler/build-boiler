import {merge} from 'lodash';

const config = {
  // check for more recent versions of selenium here:
  // http://selenium-release.storage.googleapis.com/index.html
  baseURL: 'http://selenium-release.storage.googleapis.com',
  drivers: {
    chrome: {
      // check for more recent versions of chrome driver here:
      // http://chromedriver.storage.googleapis.com/index.html
      version: '2.21',
      arch: process.arch,
      baseURL: 'http://chromedriver.storage.googleapis.com'
    }
  },
  logger(message) {
    global.console.log(message);
  }
};

export default function(opts, cb) {
  const selenium = require('selenium-standalone');

  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  merge(config, opts);
  selenium.install(config, cb);
}
