import events from 'events';


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

    this.on('runner:start', function(runner) {
      this.testsBy[runner.pid] = [];
    });

    this.on('suite:start', function(suite) {
      this.testsBy[suite.pid].push(true);
      if (!this.gotExecutedByAllRunner(suite.pid)) {
        return this.runSpinner(suite, 'suite');
      }

      this.indents += 1;
      this.clearSpinner();
      console.log(this.baseReporter.color('suite', '%s%s'), this.indent(), suite.title);
    });

    this.on('suite:end', function(suite) {
      this.testsBy[suite.pid].push(true);
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
      this.testsBy[test.pid].push(true);
      if (!this.gotExecutedByAllRunner(test.pid)) {
        return;
      }

      const fmt = this.indent() + this.baseReporter.color('pending', '  - %s');
      this.clearSpinner();
      this.baseReporter.cursor.CR();
      console.log(fmt, test.title);
    });

    this.on('test:pass', function(test) {
      this.testsBy[test.pid].push(true);
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
      this.testsBy[test.pid].push(true);
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

  gotExecutedByAllRunner(pid) {
    if (Object.keys(this.testsBy).length === 1) {
      return true;
    }

    const pos = this.testsBy[pid].length - 1;
    return this.gotExecutedBy(pos) === Object.keys(this.stats.runner).length;
  }
  gotExecutedBy(pos) {
    const self = this;
    let gotExecutedBy = 0;
    Object.keys(this.testsBy).forEach(function(pid) {
      !!self.testsBy[pid][pos] && gotExecutedBy++;
    });

    return gotExecutedBy;
  }

  indent() {
    return this.indents < 0 ? '' : Array(this.indents).join('  ');
  }

  runSpinner(test, color) {
    const spinStates = ['◴', '◷', '◶', '◵'];
    const testsBy = this.testsBy;
    let inSpinState = 0;

    if (this.spinner || Object.keys(this.testsBy).length === 1) {
      return;
    }

    if (!this.baseReporter.cursor.isatty) {
      this.spinner = true;
      return;
    }

    this.spinner = setInterval(function() {
      this.baseReporter.cursor.beginningOfLine();
      if (color === 'suite') {
        return process.stdout.write(this.baseReporter.color(color, test.title));
      }

      let pos = null;
      Object.keys(testsBy).forEach(function(pid) {
        if (pos === null) {
          pos = testsBy[pid].length;
        }
        pos = Math.min(pos, testsBy[pid].length);
      });

      process.stdout.write('  ' + this.baseReporter.color('medium', spinStates[inSpinState % 4]) + ' ' + this.baseReporter.color(color, test.title));
      process.stdout.write(this.baseReporter.color('medium', ' (' + this.gotExecutedBy(pos) + '/' + Object.keys(this.stats.runner).length) + ')');
      inSpinState++;
    }.bind(this), 100);
  }

  clearSpinner() {
    clearInterval(this.spinner);
    delete this.spinner;
    this.baseReporter.cursor.deleteLine();
    this.baseReporter.cursor.beginningOfLine();
  }
}

SpecReporter.reporterName = 'custom-spec';

export default SpecReporter;
