const debug = require('../packages/boiler-utils/dist/debug');
const log = debug(__filename);

log('**********testing********');
//
//
process.send && process.send('***************open me here************');
