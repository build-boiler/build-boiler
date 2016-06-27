/**
 * Destructure the `default` property if it is present
 * @param {Any} required the required module
 * @return {Any}
 */
export default function(required) {
  let mod;

  try {
    mod = required.default || required;
  } catch (err) {
    mod = required;
  }

  return mod;
}
