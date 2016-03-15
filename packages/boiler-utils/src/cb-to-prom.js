/**
 * "Thunk" a node style function with last argument
 * of callback to make use in `async` functions
 * @param {Function} fn
 * @return {Function}
 */
export default function(fn) {
  return (...args) => {
    return new Promise((res, rej) => {
      const cb = (err, data) => err ? rej(err) : res(data);

      fn.apply(fn, [...args, cb]);
    });
  };
}
