/**
 * Cleanup cookies, session storage and local storage
 * @param {Object} client the webdriver client
 * @param {Object} opts options for data to remove
 * @return {Promise} async function always returns promise
 */
export default async function(client, opts = {}) {
  const defaultCookies = ['gwauth'];
  const {cookie, localStorage, sessionStorage} = opts;

  const data = {
    Cookie: cookie ? [...defaultCookies, ...cookie] : defaultCookies,
    localStorage: localStorage || true,
    sessionStorage: sessionStorage || true
  };

  const removedData = await client.execute((data) => {
    /*eslint no-var: 0, vars-on-top: 0, no-console: 0, no-loop-func: 0*/
    var hasjQuery = window.jQuery;
    var hasCookie = window.Cookie;
    var hasLocal = window.localStorage;
    var hasSession = window.sessionStorage;
    var removed = {};

    function storageRemove(method, value, name, key) {
      var removedVal = removed[key];
      method.remove(name);
      removed[key] = Array.isArray(removedVal) ? removedVal.concat(name) : [name];
    }

    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var value = data[key];

        var storageMethod = window[key];
        if (storageMethod) {
          switch (key) {
            case 'Cookie':
              value.forEach(function(name) {
                storageRemove(storageMethod, value, name, key);
              });
              break;
            case 'localStorage':
            case 'sessionStorage':
              /*intentional fall through*/
              if (Array.isArray(value)) {
                value.forEach(function(name) {
                  storageRemove(storageMethod, value, name, key);
                });
              } else {
                storageMethod.clear();
                removed[key] = true;
              }
              break;
          }
        }
      }
    }

    return removed;
  }, data);

  return removedData;
}
