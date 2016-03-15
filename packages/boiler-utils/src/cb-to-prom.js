/**
 * "Thunk" a node style function with last argument
 * of callback to make use in `async` functions
 * @param {Function} fn
 * @param {Function|Object} ctx context
 * @return {Function}
 */
export default function(fn, {ctx}) {
  return (...args) => {
    return new Promise((res, rej) => {
      const cb = (err, data) => err ? rej(err) : res(data);

      fn.apply(ctx || fn, [...args, cb]);
    });
  };
}
