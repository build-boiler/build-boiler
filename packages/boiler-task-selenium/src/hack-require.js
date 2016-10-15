// Libraries
import fs from 'fs';
import _ from 'lodash';
import requireHacker from 'require-hacker';
// Configuration
import {defaults as defaultBrowsers} from './browser-stack/browsers';
import {defaults as defaultDevices} from './browser-stack/devices';


export default {
  /**
   * Hack all `require` calls for a matching regex
   * @param {RegExp} pathRe match all filepaths required
   * @param {String} name name of the hook
   * @param {Object} opts command line options for browsers/devices
   * @return {Object} hook instance that can be `unmount`ed
   */
  init(pathRe, name, opts) {
    const babel = require('babel-core');
    const {desktop, mobile} = opts;
    const desktopRe = /^.+?\/desktop\/.+?\.jsx?$/;
    const mobileRe = /^.+?\/mobile\/.+?\.jsx?$/;
    const desktopCliArg = !_.isUndefined(desktop);
    const mobileCliArg = !_.isUndefined(mobile);

    return requireHacker.global_hook('specs', fp => {
      const isDesktop = desktopRe.test(fp);
      const isMobile = mobileRe.test(fp);
      let ret;

      //TODO: this is/else logic is very specific to donate and their current structure
      //of desktop/mobile directories. Preferred approach would be to `export` browsers/devices
      //from files and all of the `else` logic would be unnecessary
      if (pathRe.test(fp)) {
        const content = fs.readFileSync(fp, {encoding: 'utf8'});
        const re = /export default *\{/;
        const match = re.exec(content);
        let str;
        //const start = match.index;
        if (_.isArray(match)) {
          str = match[0];
          const rest = content.split(str).splice(-1)[0];
          let open = 1;

          for (let i = 0; i < rest.length; i += 1) {
            const chr = rest[i];

            if (!open) {
              break;
            } else if (chr === '}') {
              open -= 1;
            } else if (chr === '{') {
              open += 1;
            }

            str += chr;
          }

        } else if (desktopCliArg && isDesktop) {
         //add default browsers/devices if test file doesn't export anything
          const defaults = {
            desktop: _.isArray(desktop) ? desktop : defaultBrowsers
          };

          str = `export default ${JSON.stringify(defaults)}`;
        } else if (mobileCliArg && isMobile) {
          const defaults = {
            mobile: _.isArray(mobile) ? mobile : defaultDevices
          };

          str = `export default ${JSON.stringify(defaults)}`;
        } else if (!isMobile && !isDesktop) {
          //if the file is not in a desktop/or mobile directory
          const defaults = {};

          if (desktopCliArg) {
            _.assign(defaults, {
              desktop: _.isArray(desktop) ? desktop : defaultBrowsers
            });
          }

          if (mobileCliArg) {
            _.assign(defaults, {
              mobile: _.isArray(mobile) ? mobile : defaultDevices
            });
          }

          str = `export default ${JSON.stringify(defaults)}`;
        }

        const {code} = babel.transform(str, {
          presets: [require.resolve('babel-preset-es2015-node4')],
          plugins: ['add-module-exports']
        });

        ret = code;
      }

      return ret;
    });
  },
  /**
   * Remove the `require` hook
   * @param {Object} inst `require-hacker` instance
   * @return {Boolean}
   */
  unmount(inst) {
    inst.unmount();
    return true;
  }
};
