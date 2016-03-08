/**
 * Thunk function for a function with last argument as a `cb` that is called with only 1 or less arguments
 * @param {Function} fn
 * @return {Function} first function to be called
 */
export default function(fn, ctx) {
  return (...args) => {
    return (cb) => {
      fn.apply(ctx || null, args.length ? [...args, cb] : [cb]);
    };
  };
}
