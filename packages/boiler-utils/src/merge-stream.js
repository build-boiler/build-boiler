import flattenDeep from 'lodash/flattenDeep';
import merge from 'merge-stream';

/**
 * Small wrapper around merge-stream in order to merge gulp streams together
 * `event-stream` was not signaling async completion in gulp 4
 * @param {Arguments} args streams
 *
 * @return {Stream} a single stream to be consumed by gulp
 */
export default function(...args) {
  return merge.apply(merge, flattenDeep(args));
}
