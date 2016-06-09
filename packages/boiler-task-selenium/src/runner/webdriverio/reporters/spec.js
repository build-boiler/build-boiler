import events from 'events';


/**
 * Custom spec reporter adapted from https://github.com/Baltino/wdio-spec-reporter
 *
 */
class SpecReporter extends events.EventEmitter {
  constructor(baseReporter, config, options = {}) {
    super();

    this.baseReporter = baseReporter;
    this.config = config;
    this.options = options;

    const { epilogue } = this.baseReporter;

    this.stats = {};
    this.testsBy = {};
    this.indents = 0;
    this.errorCount = 0;

    /**
     * remember which tests got executed by runner
     */
    this.on('runner:start', function(runner) {
      this.testsBy[runner.pid] = [];
    });

    this.on('suite:start', function(suite) {
      /**
       * mark state for runner as "reached"
       */
      this.testsBy[suite.pid].push(true);
      /**
       * only continue if all runner have reached that state
       * otherwise show spinner ascii gimmick
       */
      if (!this.gotExecutedByAllRunner(suite.pid)) {
        return this.runSpinner(suite, 'suite');
      }

      this.indents += 1;
      this.clearSpinner();
      console.log(this.baseReporter.color('suite', '%s%s'), this.indent(), suite.title);
    });

    this.on('suite:end', function(suite) {
      /**
       * mark state for runner as "reached"
       */
      this.testsBy[suite.pid].push(true);
      /**
       * only continue if all runner have reached that state
       */
      if (!this.gotExecutedByAllRunner(suite.pid)) {
        return;
      }

      this.indents -= 1;
      if (this.indents === 1) {
        console.log();
      }
    });

    this.on('test:start', function(test) {
      if (this.spinner) {
        return;
      }

      this.runSpinner(test, 'pass');
    });

    this.on('test:pending', function(test) {
      /**
       * mark state for runner as "reached"
       */
      this.testsBy[test.pid].push(true);
        /**
         * only continue if all runner have reached that state
         * otherwise show spinner ascii gimmick
         */
      if (!this.gotExecutedByAllRunner(test.pid)) {
        return;
      }

      const fmt = this.indent() + this.baseReporter.color('pending', '  - %s');
      this.clearSpinner();
      this.baseReporter.cursor.CR();
      console.log(fmt, test.title);
    });

    this.on('test:pass', function(test) {
      /**
       * mark state for runner as "reached"
       */
      this.testsBy[test.pid].push(true);
      /**
       * only continue if all runner have reached that state
       */
      if (!this.gotExecutedByAllRunner(test.pid)) {
        return;
      }

      const fmt = this.indent() +
                  this.baseReporter.color('checkmark', '  ' + this.baseReporter.symbols.ok) +
                  this.baseReporter.color('pass', ' %s');
      this.clearSpinner();
      this.baseReporter.cursor.CR();
      console.log(fmt, test.title);
    });

    this.on('test:fail', function(test) {
      /**
       * mark state for runner as "reached"
       */
      this.testsBy[test.pid].push(true);
      /**
       * only continue if all runner have reached that state
       */
      if (!this.gotExecutedByAllRunner(test.pid)) {
        return;
      }

      this.clearSpinner();
      this.baseReporter.cursor.CR();
      console.log(this.indent() + this.baseReporter.color('fail', '  %d) %s'), ++this.errorCount, test.title);
    });

    this.on('end', function() {
      this.clearSpinner();
      epilogue.call(baseReporter);
      console.log();
    });
  }

  /**
   * returns true if test got executed by all runner
   */
  gotExecutedByAllRunner(pid) {
    /**
     * always true when there is only one runner
     */
    if (Object.keys(this.testsBy).length === 1) {
      return true;
    }

    const pos = this.testsBy[pid].length - 1;
    return this.gotExecutedBy(pos) === Object.keys(this.stats.runner).length;
  }
  /**
   * returns number of how many runners have executed the test
   */
  gotExecutedBy(pos) {
    const self = this;
    let gotExecutedBy = 0;
    Object.keys(this.testsBy).forEach(function(pid) {
      /**
       * only increase variable if runner has executed the tes
       */
      !!self.testsBy[pid][pos] && gotExecutedBy++;
    });

    return gotExecutedBy;
  }

  indent() {
    return this.indents < 0 ? '' : Array(this.indents).join('  ');
  }

  /**
   * starts little ascii spinner gimick
   */
  runSpinner(test, color) {
    const spinStates = ['◴', '◷', '◶', '◵'];
    const testsBy = this.testsBy;
    let inSpinState = 0;

    /**
     * no need for a spinner if one is already spinning or if we only have one runner
     */
    if (this.spinner || Object.keys(this.testsBy).length === 1) {
      return;
    }

    /**
     * no fancy spinner without tty
     */
    if (!this.baseReporter.cursor.isatty) {
      this.spinner = true;
      return;
    }

    this.spinner = setInterval(function() {
      this.baseReporter.cursor.beginningOfLine();
      /**
       * no special spinner for suite label
       */
      if (color === 'suite') {
        return process.stdout.write(this.baseReporter.color(color, test.title));
      }

      /**
       * get position of slowest runner
       */
      let pos = null;
      Object.keys(testsBy).forEach(function(pid) {
        if (pos === null) {
          pos = testsBy[pid].length;
        }
        pos = Math.min(pos, testsBy[pid].length);
      });

      /**
       * need util.print here as it prints with right encoding
       */
      process.stdout.write('  ' + this.baseReporter.color('medium', spinStates[inSpinState % 4]) + ' ' + this.baseReporter.color(color, test.title));
      process.stdout.write(this.baseReporter.color('medium', ' (' + this.gotExecutedBy(pos) + '/' + Object.keys(this.stats.runner).length) + ')');
      inSpinState++;
    }.bind(this), 100);
  }

  /**
   * remove and clear spinner
   */
  clearSpinner() {
    clearInterval(this.spinner);
    delete this.spinner;
    this.baseReporter.cursor.deleteLine();
    this.baseReporter.cursor.beginningOfLine();
  }
}

SpecReporter.reporterName = 'custom-spec';

export default SpecReporter;
