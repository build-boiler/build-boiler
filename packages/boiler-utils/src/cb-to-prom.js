/**
 * "Thunk" a node style function with last argument
 * of callback to make use in `async` functions
 * @param {Function} fn
 * @return {Function}
 */
export default function(fn) {
  return (arg) => {
    return new Promise((res, rej) => {
      fn.call(fn, arg, (err, data) => {
        if (err) return rej(err);

        res(data);
      });
    });
  };
}

