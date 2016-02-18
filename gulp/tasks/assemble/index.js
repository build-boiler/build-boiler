export default function(gulp, plugins, config, opts) {
  /*eslint-disable*/
  const {app, nunj} = opts;
  console.log('****CALLED***');

  app.onLoad(/\.html$/, (file, next) => {
    console.log('ASSEMBLE', file.path);

    next();
  });

  return {
    src: []
  };
}
