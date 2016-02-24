export default function(gulp, plugins, config, opts) {
  /*eslint-disable*/
  const {src, data} = opts;
  const {app, nunj, assets} = data;

  app.onLoad(/\.html$/, (file, next) => {
    next();
  });

  return {
    src: []
  };
}
