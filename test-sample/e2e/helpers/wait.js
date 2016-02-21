/**
 * Utility to wait a given amount of time
 * @param {Number} delay
 * @param {Number} counter
 * @return {Promise}
 */
export default function(delay = 500, counter = 0) {
  return new Promise((res) => setTimeout(res.bind(null, counter += delay), delay));
}
