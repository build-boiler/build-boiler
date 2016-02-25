import _ from 'lodash';

export default function(externals = [], isServer) {
  return externals.reduce((acc, data) => {
    const {name, provide} = data;

    //HACK: for issue with external jquery in commonjs
    //http://stackoverflow.com/questions/22530254/webpack-and-external-libraries
    if (isServer && /jquery/i.test(name)) return acc;

    acc.externals = acc.externals || {};
    acc.provide = acc.provide || {};

    _.assign(acc.externals, name);
    _.assign(acc.provide, provide);

    return acc;
  }, {});
}
