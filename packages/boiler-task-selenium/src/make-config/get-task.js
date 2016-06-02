import {isArray} from 'lodash';

export default function({config, utils}) {
  const {getTaskName} = utils;
  const {metaData} = config;
  let split = getTaskName(metaData);
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
