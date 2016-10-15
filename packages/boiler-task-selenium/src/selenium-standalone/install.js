import {merge} from 'lodash';
import config from './config';


export default function(opts, cb) {
  const selenium = require('selenium-standalone');

  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  merge(config, opts);
  selenium.install(config, cb);
}
