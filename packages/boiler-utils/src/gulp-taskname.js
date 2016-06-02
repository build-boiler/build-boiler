import DefaultRegistry from 'undertaker-registry';

export default function(gulp) {

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
