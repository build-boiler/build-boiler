
  //if (isMainTask) {
    //Object.assign(defaultConfig, {
      //eslint: {
        //rules,
        //configFile,
        //formatter,
        //emitError: false,
        //emitWarning: false,
        //failOnWarning: !isDev,
        //failOnError: !isDev
      //}
    //});
  //}

  //const defaultExternals = {
    //'sinon': 'window.sinon'
  //};

  //const coverageConfig = {
    //isparta: {
      //embedSource: true,
      //noAutoWrap: true,
      //babel: babelQuery
    //}
  //};

    //test() {
      //const testConfig = {
        //module: {
          //preLoaders,
          //loaders,
          //postLoaders
        //},
        //plugins,
        //watch: true,
        //devtool: 'inline-source-map'
      //};

      //return _.merge({}, defaultConfig, testConfig, coverageConfig);
    //},

    //ci() {
      //const uglifyLoader = {
        //test: /\.jsx?$/,
        //loader: 'uglify',
        //exclude: /\-spec\.js$/
      //};
      //const ciConfig = {
        //module: {
          //preLoaders,
          //loaders,
          //postLoaders: [uglifyLoader, ...postLoaders]
        //},
        //plugins,
        //// allow getting rid of the UglifyJsPlugin
        //// https://github.com/webpack/webpack/issues/1079
        //'uglify-loader': {
          //compress: {warnings: false}
        //}
      //};

      //return _.merge({}, defaultConfig, ciConfig, coverageConfig);
    //}
