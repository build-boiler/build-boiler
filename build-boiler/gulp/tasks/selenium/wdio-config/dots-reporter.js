/*eslint no-console: 0*/
import Dots from 'webdriverio/lib/reporter/dot';

let cntError = 0;
let hasPrintedStatus = false;
let errors = 0;

//TODO: fix this so already reported "dots" after failure log are not printed
/**
 * Light extension of webdriverio dots reporter to log some additional error info
 */
export default class CustomDots extends Dots {
  constructor() {
    super();
    this.on('test:fail', this.fail);
  }

  fail(test) {
    const {pid, title, parent} = test;
    const {browserName} = test.runner[pid];
    const errorCount = ++cntError;

    console.log('\n');
    process.stdout.write(this.color('fail', `${errorCount}) ${parent} => ${title} => ${browserName}`));
    console.log('\n');
  }

  printDots(color) {
    let tests = null;
    let minExecutedTests = null;
    const {runner: statsRunner} = this.stats;

    Object.keys(statsRunner).forEach((pid, i) => {
      const runner = statsRunner[pid];

      tests = Math.max(tests || runner.tests.length, runner.tests.length);
      minExecutedTests = Math.min(minExecutedTests || runner.tests.length, runner.tests.length);
    });

    function checkIfTestHasPassed(i) {
      let hasPassed = true;

      Object.keys(statsRunner).forEach((pid) => {
        const runner = statsRunner[pid];

        if (i > runner.tests.length - 1) {
          return;
        }

        hasPassed = hasPassed && runner.tests[i] === null;
      });

      return hasPassed;
    }

    let passed = 0;
    let pending = 0;
    let failed = 0;

    for (let i = 0; i < tests; i += 1) {
      const hasTestPassed = checkIfTestHasPassed(i);

      //HACK: couldn't figure out a good way to report errors so just did a quick fix
      if (hasTestPassed) {
        minExecutedTests <= i ? pending += 1 : passed += 1;
      } else {
        failed += 1;
      }
    }

    if (!hasPrintedStatus) {
      console.log('\n');
      this.cursor.beginningOfLine();
      process.stdout.write(this.color('green', 'Processing => '));
      process.stdout.write(this.color('green', `${passed}) passed, `));
      process.stdout.write(this.color('medium', `${pending}) pending, `));
      hasPrintedStatus = true;
    }

    if (errors < failed) {
      process.stdout.write(this.color('fail', `${failed}) failed `));
      hasPrintedStatus = false;
      errors = failed;
    }

    process.stdout.write(this.color('green', this.symbols.dot));
  }
}
