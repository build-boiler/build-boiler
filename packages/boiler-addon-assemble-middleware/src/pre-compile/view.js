/**
 * Add the `view` to `file.data
 * https://github.com/jonschlinkert/templates/issues/17
 */
export default (file, next) => {
  const fallback = {
    key: file.key,
    path: file.path
  };

  file.data.view = file.data.view || fallback;
  next();
};
