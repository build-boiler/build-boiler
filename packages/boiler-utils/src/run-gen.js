import _ from 'lodash';

/**
 * Run function for generators accepting a callback of Node or non-Node signature
 * @param {Generator} genFn
 * @return {undefined} use `yield` inside Generator callback
 */
export default function(genFn) {
  const it = genFn();

  function _next(err, data) {
    /**
     * make this work for Node and non-Node style, if there is no error argument
     * `data` becomes `err`
     */
    if (err !== null && !_.isError(err)) {
      data = err;
    } else if (_.isError(err)) {
      it.throw(err);
    }

    const nextData = it.next(data);

    if (!nextData.done) {
      const fnToCall = nextData.value;

      fnToCall(_next);
    }
  }

  _next();
}
