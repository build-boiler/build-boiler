export default {
  // check for more recent versions of selenium here:
  // http://selenium-release.storage.googleapis.com/index.html
  baseURL: 'http://selenium-release.storage.googleapis.com',
  version: '3.0.0',
  drivers: {
    chrome: {
      version: '2.24'
    },
    firefox: {
      version: '0.11.1'
    }
  },
  logger(message) {
    global.console.log(message);
  }
};
