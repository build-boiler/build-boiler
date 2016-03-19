import path from 'path';

export default function(gulp, plugins, config) {
  const {mocha} = plugins;
  const {file, utils} = config;
  const {addbase} = utils;
  const src = addbase('packages', '*', 'test', `**/${file || '*'}-spec.js`);

  return () => {
    gulp.src(src, {read: false})
      .pipe(mocha({
        require: path.join(__dirname, 'hook.js')
      }));
  };
}
