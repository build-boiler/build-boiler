import {isArray} from 'lodash';

export default function({gulp, config}) {
  const {utils} = config;
  const {getTaskName} = utils;
  const taskName = config.metaData || gulp.currentTask;
  let split = getTaskName(taskName);
  let task, suffix;

  if (isArray(split)) {
    task = split[0];
    suffix = split[1];
  } else {
    task = split;
  }

  return {
    task,
    suffix
  };
}
