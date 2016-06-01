const nightwatch = require('nightwatch');

const argv = JSON.parse(process.argv[2]);

nightwatch.runner(argv, function(success) {
  if (!success) {
    process.exit(1);
  } else {
    process.exit(0);
  }
});
