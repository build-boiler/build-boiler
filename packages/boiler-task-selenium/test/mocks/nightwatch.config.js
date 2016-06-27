export default {
  customSettings: {
    globals: {
      waitForConditionTimeout: 20000
    }
  },
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
  },
  specsDir: './test/e2e/nightwatch',
  commandsDir: './test/e2e/nightwatch/commands',
  runner: 'nightwatch'
};
