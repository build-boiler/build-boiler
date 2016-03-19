//export const config = ;
//expor const loaders = ;
//
    //server() {
      //const {isomorphic = {}} = config;
      //const {context} = isomorphic;
      //const {devPort, devHost} = sources;
      //const {branch, asset_path: assetPath} = environment;
      //const bsPath = `http://${devHost}:${devPort}/`;
      //const publicPath = _.isUndefined(branch) ?  bsPath : `${assetPath}/`;
      //const {modules = {}} = isomorphic;
      //const {target} = modules;

      ////HACK: for issue with external jquery in commonjs
      ////http://stackoverflow.com/questions/22530254/webpack-and-external-libraries
      //const alias = Object.keys(externals || {}).reduce((acc, key) => ({
        //...acc,
        //[key]: join(__dirname, 'mocks', 'noop')
      //}), {});

      //const serverExternals = getExcludes(config);

      //const serverConfig = {
        //externals: serverExternals,
        //context,
        //entry,
        //output: {
          //path: addbase(buildDir),
          //publicPath,
          //filename: join('js', jsBundleName),
          //libraryTarget: 'commonjs2'
        //},
        //module: {
          //loaders
        //},
        //resolve: {
          //alias
        //},
        //plugins,
        //target
      //};

      //return _.merge(
        //{},
        //_.omit(defaultConfig, ['externals']),
        //serverConfig
      //);
    //},
