import _ from 'lodash';

export default function(externals = []) {
  return externals.reduce((acc, data) => {
    const {name, provide} = data;
    acc.externals = acc.externals || {};
    acc.provide = acc.provide || {};

    _.assign(acc.externals, name);
    _.assign(acc.provide, provide);

    return acc;
  }, {});
}
