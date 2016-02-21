import wait from './wait';

/**
 * Poll the `client.execute` function for expected data
 * TODO: potentially add a timeout as this might not be performant
 *
 * @param {Function} cb `client.execute` function
 * @param {String} property desired property on the `response` object
 * @param {Number} delay
 * @return {Promise} "thenable" resolving `response`
 */
let counter = 0;

async function pollForResponse(cb, property = 'value', delay = 500) {
  //wait a little bit
  //TODO: allow passing this in as an argument
  const count = await wait(delay, counter);

  const response = await cb();
  const {value} = response || {};
  const hasValue = property !== 'value' ? value && value[property] : value;
  let ret;

  if (!!hasValue) {
    ret = response;
  } else if (count < 10000) {
    ret = await pollForResponse(cb, property);
  } else {
    throw new Error('GW response not recieved');
  }

  counter = 0;
  return ret;
}

export default pollForResponse;
