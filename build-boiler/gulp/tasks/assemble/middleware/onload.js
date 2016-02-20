import matter from 'parser-front-matter';

export default function(app, config) {
  app.onLoad(/\.(?:md|html)$/, (file, next) => {
    matter.parse(file, (err, file) => {
      if (err) return next(err);

      next(null, file);
    });
  });
}
