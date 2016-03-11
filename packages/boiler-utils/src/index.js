import requireDir from './require-dir';

const utils = requireDir(__dirname, {
  ignore: 'index',
  dict: 'basename'
});

export default utils;

