import isFunction from 'lodash/isFunction';

/**
 * Check if `gulp` is version 3 or 4 and hack around to add
 * the current task name
 * https://github.com/gulpjs/gulp/issues/689
 * http://stackoverflow.com/questions/27161903/how-to-get-task-name-inside-task-in-gulp
 * @param {Object} gulp the gulp module
 * @return {undefined}
 */
export default function(gulp) {
  const isGulp3 = isFunction(gulp.Gulp && gulp.Gulp.prototype && gulp.Gulp.prototype._runTask);

  if (isGulp3) {
    gulp.Gulp.prototype.__runTask = gulp.Gulp.prototype._runTask;
    gulp.Gulp.prototype._runTask = function(task) {
      const {name} = task;
      const metaData = {name};

      this.metaData = {metaData};
      this.__runTask(task);
    };
  } else {
    const DefaultRegistry = require('undertaker-registry');

    class TaskMetadataRegistry extends DefaultRegistry {
      constructor() {
        super();
      }

      set(name, fn) {
        const metaData = {name};
        const task = this._tasks[name] = fn.bind({metaData});

        return task;
      }
    }

    gulp.registry(new TaskMetadataRegistry());
  }
}
