/**
 * Add the `view` to `file.data
 * https://github.com/jonschlinkert/templates/issues/17
 */
export default (file, next) => {
  file.data.view = file;
  next(null, file);
};
