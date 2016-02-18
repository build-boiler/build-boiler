import open from 'open';

export default function(gulp, plugins, config) {
  const {browserSync} = plugins;
  const {sources, utils} = config;
  const {internalHost, devPort, buildDir} = sources;
  const {addbase} = utils;
  const openPath = `http://${internalHost}:${devPort}`;

  const middleware = [
    (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'authorization, accept');
      res.setHeader('Access-Control-Max-Age', '1728000');
      if (req.method === 'OPTIONS') {
        res.end();
      } else {
        next();
      }
    }
  ];

  return (cb) => {
    const bsConfig = {
      open: false,
      port: devPort,
      server: {
        baseDir: addbase(buildDir),
        middleware
      }
    };

    browserSync(bsConfig, () => {
      open(openPath);
      cb();
    });
  };
}
