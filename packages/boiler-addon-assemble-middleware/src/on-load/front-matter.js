import matter from 'parser-front-matter';

export default function(file, next) {
  matter.parse(file, (err, file) => {
    if (err) return next(err);

    next(null, file);
  });
}
