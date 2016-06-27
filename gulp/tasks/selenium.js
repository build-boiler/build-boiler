export default function(gulp, plugins, config, opts) {
  const {data} = opts;
  let newData;

  if (!process.argv.includes('mocha')) {
    newData = data.map(testConfig => {
      const {capabilities} = testConfig;

      const caps = capabilities.map(cap => {
        let newCap;

        if (cap.browserName === 'chrome') {
          newCap = Object.assign({}, cap, {
            browser_version: '46.0'
          });
        }

        return newCap || cap;
      });

      return Object.assign({}, testConfig, {capabilities: caps});
    });
  }

  return {
    data: newData || data
  };
}
