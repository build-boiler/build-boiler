import _ from 'lodash';

/**
 * Utility to check if something is a `Stream`
 * @param {Object} check
 * @return {Boolean|undefined}
 */
export default function(check) {
  let ret;

  ret = _.isFunction(check && check.constructor);

  if (ret) {
    const {name} = check.constructor;
    ret = name === 'Transform' || name === 'Stream';
  }

  return ret;
}
