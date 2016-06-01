export default function getSeleniumStandaloneOptions() {
  return {
    installOpts: {
      version: '2.48.2'
    },
    startOptions: {
      version: '2.53.0',
      logLevel: 'verbose',
      spawnOptions: {
        logLevel: 'verbose',
        stdio: 'ignore'
      }
    }
  };
}
