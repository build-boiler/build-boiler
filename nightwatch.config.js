export default {
  specsDir: './test/e2e/nightwatch',
  commandsDir: './test/e2e/nightwatch/commands',
  runner: 'nightwatch',
  customSettings: {
    globals: {
      waitForConditionTimeout: 20000
    }
  }
};
