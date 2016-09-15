// Libraries
import {readFile} from 'fs';
// Packages
import boilerUtils from 'boiler-utils';


const {buildLogger, gulpTaskUtils} = boilerUtils;
const {logError} = gulpTaskUtils;
const {log} = buildLogger;
export default function readLines(fp, offset = 50, cb) {
  try {
    readFile(fp, 'utf8', (err, content) => {
      const lines = content.split('\n');
      log(`-------------------- START reading ${fp}`);
      log([
        ...lines.slice(0, offset),
        '....................',
        ...lines.slice(-offset)
      ].join('\n'));
      log(`-------------------- END reading ${fp}`);

      cb();
    });
  } catch (err) {
    logError({err, plugin: '[read-lines]'});
  }
}
