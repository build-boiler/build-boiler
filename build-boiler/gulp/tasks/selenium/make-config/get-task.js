import {isArray} from 'lodash';

export default function({gulp, utils}) {
  const {getTaskName} = utils;
  const taskName = gulp.currentTask;
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
