/**
 * "Thunk" a node style function with last argument
 * of callback to make use in `async` functions
 * @param {Function} fn
 * @param {Object} opts options
 * @param {Function|Object} opts.ctx context
 * @return {Function}
 */
export default function(fn, opts = {}) {
  const {ctx} = opts;

  return (...args) => {
    return new Promise((res, rej) => {
      const cb = (err, data) => err ? rej(err) : res(data);

      fn.apply(ctx || fn, [...args, cb]);
    });
  };
}
