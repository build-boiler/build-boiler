import modifyQuery from './utils/add-rewire';

export default function(config, data) {
  const {
    coverage,
    karma = {},
    TEST
  } = config;
  const {coverageRe} = karma;
  const testCoverage = coverage && TEST;

  if (TEST) {
    const {preLoaders, loaders} = data;

    if (testCoverage) {
      const isparta = {
        test: /\.jsx?$/,
        loader: 'isparta',
        exclude: /\/(test|node_modules)\//,
        include: coverageRe
      };

      preLoaders.unshift(isparta);
    }

    loaders.forEach(loaderData => {
      const {loader, exclude, query} = loaderData;

      /**
       * Update the `exclude` function for `babel-loader`
       */
      if (/babel/.test(loader)) {
        if (testCoverage) {
          loaderData.exclude = (fp) => {
            let ex = exclude(fp);

            //TODO: remove HFA specific logic
            const shouldTest = testCoverage &&
              !/\@hfa/.test(fp) &&
              !/node_modules/.test(fp);

            if (!ex && shouldTest) {
              ex = coverageRe.test(fp);
            }

            return ex;
          };
        }

        loaderData.query = modifyQuery(query);
      }
    });
  }

  return data;
}
