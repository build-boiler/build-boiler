import path from 'path';
import makeGulpConfig from './gulp/config/make-gulp-config.js';
import requireDir from './gulp/utils/require-dir';

const utilsDir = path.join(__dirname, 'gulp', 'utils');

export const utils = requireDir(utilsDir, {dict: 'dirname'});

export default makeGulpConfig;
