import _ from 'lodash';

/**
 * poll the "thenable" function returned from cb
 * @param {Function} cb anonymous function returning "thenable" function
 * @param {Number|undefined} timeout
 * @return {Promise}
 */
export default function(cb, timeout = 5000) {
  const startTime = new Date().getTime();

  return new Promise((res, rej) => {

    function _resolver(data) {
      const endTime = new Date().getTime();
      const diff = endTime - startTime;

      if (diff > timeout) {
        //if after the specified timeout the webdriver command is unsuccessful
        //reject the promise
        rej(data);
      } else {
        //if the specified timeout has not been reached try the command again
        setTimeout(_poll, 500);
      }
    }

    function _poll() {
      //try to execute the webdriver command for a first time
      //or recursively after a failure
      const webdriverPromise = cb();

      webdriverPromise.then((data) => {
        if (_.isBoolean(data) && data === false) {
          _resolver(data);
        } else {
          //if webdriver command is successful resolve the promise
          res(data);
        }
      }).catch((err) => {
        _resolver(err);
      });
    }

    //immediately invoke the `_poll` function
    _poll();
  });
}
