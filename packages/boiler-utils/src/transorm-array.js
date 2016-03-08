import _ from 'lodash';

/**
 * Utility to transform item to an array based upon
 * a optional check function
 * @param {Any} topic
 *
 * @return {Array}
 */
export default function(topic, checkFn) {
  const ret = [];
  const passesCheck = _.isFunction(checkFn) && checkFn(topic);
  const isArray = Array.isArray(topic);

  if (passesCheck || isArray) {
    isArray ? ret.push(..._.flatten(topic)) : ret.push(topic);
  }

  return ret;
}
