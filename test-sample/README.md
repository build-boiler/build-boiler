## Integration and End to End Testing

#### Integration Testing - Karma
Karma is used for our integration testing. Integration tests are useful for two main reasons:
- to test React Components and how user interaction effects component state and UI
- to test utility functions and flux modules (i.e. Nuclearjs)

Integration tests are generally easier to construct and more reliable than End to End tests. That said, overhead in testing can come in the form of setting up component and flux state, as well as mocking HTTP requests or "Rewiring" components that make external requests. Some utilities built into our test suite are useful for these interactions:
- [React Test Utils](https://facebook.github.io/react/docs/test-utils.html)
- [babel-plugin-rewire](https://www.npmjs.com/package/babel-plugin-rewire)
- [Sinon](http://sinonjs.org/)

##### Running Integration Tests
All of your integration tests should be inside of the `test/integration` directory, and they must have a suffix of `-spec.js`. It is best to structure your tests in the same directory structure as the components/modules/functions that you are testing. The [frontent-boilerplate](https://github.com/HillaryClinton/frontend-boilerplate/tree/master/test/integration) has good examples of this.

```sh
./test/integration
├── components
│   └── sample-spec.js
└── modules
    └── first-spec.js
```

###### Commands
```sh
$ gulp test:integration # or
$ gulp test karma -e dev # run tests locally
$ gulp test karma # run tests in `ci` mode on BrowserStack => you can test mobile browsers here
# pass the `--coverage` flag to any of the above commands to generate a code coverage report
$ gulp test:integration --coverage # opens a browser with your coverage repor
$ gulp test karam # generates a coverage report only in the terminal where tests are running
# pass a -f command to run a single spec file, just omit it's directory and file extension
$ gulp test:integration -f sample-spec
```

###### Specifying Browser/Devices
```sh
# run launchers locally
# ['Chrome', 'Firefox', 'FirefoxDeveloper', 'FirefoxAurora', 'FirefoxNightly', 'Safari']
gulp test:integration --desktop=firefox,FirefoxDeveloper,FirefoxAurora,FirefoxNightly,safari,chrome //run these launchers locally, check the options above

# run browsers/devices on BrowserStack
gulp karma --desktop --local //run all desktop browsers in BrowserStack (use --local to see "prettier" reporting)
gulp karma --desktop=ie //run ie in BrowserStack
gulp karma --mobile //run all mobile devices in BrowserStack
gulp karma --mobile=iphone --desktop //run all desktop browsers as well as iPhone in BrowserStack
```

#### End to End Tests - Selenium + Webdriverio
End to end tests are run with a [webddriverio](http://webdriver.io/) a JavaScript webdriver. These tests are good for testing functionality that involves external requests, analytics reporting, and states based upon query parameters. The tests are slower and less reliable than Karma Integration tests but can test a wider range of functionality.

##### Initial Setup
You must have Java installed on your local machine and the Java version must be greater than v6 `> 6`.
- Some useful links for Java installation [JAVA Runtime](https://support.apple.com/kb/DL1572?locale=en_US) specific for [Yosemite](http://fredericiana.com/2014/10/21/osx-yosemite-java-runtime-environment/)

- ensure you are on `node v4` or later

To run tests on browsers other than Chrome and Firefox, and to run tests on mobile devices you must `export` [BrowserStack](https://www.browserstack.com) credentials into your shell environment. Obtain these credentials from one of your co-workers.

```shell
# add to `.bash_profile` or `.zshrc`
export BROWSERSTACK_USERNAME='<username>'
export BROWSERSTACK_API='<key>'
export localIdentifier='<anything_can_go_here>'
```

##### Running E2E Tests
Similar to the Integration tests, all E2E test files must be named with a `-spec.js` extension or they will not be run. There are many ways to run the End to End tests, and it is important to understand how to specify which browsers/devices you would like to run the tests on. The easiest way is to `export default` the browsers/devices the test is intended to run on:

```js
//sample-spec.js
export default {
  desktop: ['chrome', 'firefox', 'ie', 'safari'],
  mobile: ['iphone'] //TODO: be able to run on more devices other than iPhone
}
```

The above syntax also supports passing a custom `Object` rather than a `String` but you must know the exact configuration of the `Object` that BrowserStack accepts. When the tests are run, all "spec" files will be sorted by device and combined with common devices shared between files so the maximum number of specs can run together for device groups. Only Chrome and Firefox can run locally on your local [selenium-standalone](https://www.npmjs.com/package/selenium-standalone) server, all other browsers/devices will run on BrowserStack. *Note*: at this time only iPhone is supported as a mobile device until we discover the exact config needed to run Android devices.

##### Commands
```sh
$ gulp selenium # runs all files and all devices
$ gulp selenium --desktop # runs all files and their associated desktop browsers
$ gulp selenium --desktop=chrome,firefox # runs all files specifying these browsers => will run locally
$ gulp selenium --desktop=chrome,i # runs all files specifying these browsers => will run on BrowserStack
$ gulp selenium --desktop=ie --force will run all files on "ie" even if the do not directly `export` it
# the above commands are the same for mobile
$ gulp selenium --mobile
$ gulp selenium --mobile=iphone
$ gulp selenium --mobile=iphone --force
# single spec files can also be run, you don't need to specify `--force` if the file doesn't `export` the browser/device you want to test
$ gulp selenium sample-spec
$ gulp selenium --desktop -f sample-spec
$ gulp selenium --desktop=ie -f sample-spec
# you can also just setup the BrowserStack tunnel so you can do "live" QA of browsers/devices on your local IP
$ gulp selenium:tunnel
```

##### Debugging
It's possible to run e2e tests in 4 different ways
- test local browser launchers (only Chrome and Firefox) on a local selenium server against `localhost`
```sh
gulp selenium --desktop //runs specs in `desktop` directory on Chrome and Firefox
gulp selenium --desktop=chrome,firefox
```

- test `localhost` on various browsers/devices on BrowserStack
```sh
gulp selenium:tunnel --desktop //runs specs in `desktop` directory on Chrome and Firefox
gulp selenium --desktop=chrome,firefox,safari //automatically runs on BS because Safari is not local
gulp selenium --desktop --mobile=iphone //run chrome an firefox on BS, and when complete run iPhone on specs in `mobile` directory
```

- test `www.hfa.io/<your_bucket_path>/<git_branch>` on BrowserStack by running local command, this will also force mobile/desktop tests to run concurrently.
```sh
TRAVIS_BRANCH=<any_branch_except_master> gulp selenium:tunnel --desktop //runs specs in `desktop` directory on Chrome and Firefox
TRAVIS_BRANCH=<any_branch_except_master> gulp selenium --desktop=chrome,firefox,safari //automatically runs on BS because Safari is not local
TRAVIS_BRANCH=<any_branch_except_master> gulp selenium --mobile --local //`local` flag uses "spec" reporter and not "dots" for nicer local terminal output
```

- test `www.hfa.io/<your_bucket_path>/<git_branch>` on BrowserStack through CI
  - this is automatic as travis runs `npm run test:e2e:all` from `package.json` in `.travis.yml`

##### Configuring Capabilities
https://www.browserstack.com/automate/node#setting-os-and-browser
https://www.browserstack.com/list-of-browsers-and-platforms?product=automate
https://www.browserstack.com/automate/capabilities#capabilities-general

###### VM Broswer QA on BrowserStack Live
- test the local IP on BrowserStack virtual browsers
- run `gulp selenium:tunnel`
- [BrowserStack Live](https://www.browserstack.com/start) view local site in various browsers on BrowserStack
