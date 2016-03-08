import _ from 'lodash';

export default function(cmd, cb) {
  let check;

  try {
    cmd.length ? cmd(check) : cmd();
  } catch (err) {
    if (check) {
      if (_.isFunction(cb)) {
        cb(err);
      } else {
        throw err;
      }
    }
  }
}
