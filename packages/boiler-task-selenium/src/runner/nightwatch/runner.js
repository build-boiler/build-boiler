// NOTE: This has to be run as a child process (and without babel-node)
// so we can support parallel test runs via Nightwatch!
const nightwatch = require('nightwatch');

const argv = JSON.parse(process.argv[2]);
nightwatch.runner(argv, function(success) {
  if (!success) {
    process.exit(1);
  } else {
    process.exit(0);
  }
});
