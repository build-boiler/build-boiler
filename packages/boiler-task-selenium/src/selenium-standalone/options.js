import config from './config';


const {version, drivers} = config;
export default {
  installOpts: {
    version,
    drivers
  },
  startOptions: {
    version,
    drivers,
    logLevel: 'verbose',
    spawnOptions: {
      logLevel: 'verbose',
      stdio: 'ignore'
    }
  }
};
