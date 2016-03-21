import path from 'path';
import fs from 'fs-extra';
import boilerUtils from 'boiler-utils';

/**
 * Webpack loader used for "SERVER" build to load local
 * assets such as Images and CSS from the stats created
 * by Webpack Isomporphic Tools
 * @param {Buffer} content
 * @return {undefined} uses the `cb` callback to pass data to the `compiler`
 */
export default function(content) {
  this.cacheable && this.cacheable();
  const {renameKey} = boilerUtils;
  const cb = this.async();
  const resourcePath = renameKey(this.resourcePath);

  fs.readJson(path.join(process.cwd(), 'dist', 'webpack-main-stats.json'), (err, data) => {
    if (err) {
      cb(err);
    } else {
      const {assets} = data;
      const [assetData] = Object.keys(assets).reduce((list, assetPath) => {
        const asset = assets[assetPath];

        return resourcePath === renameKey(assetPath) ? [...list, asset] : list;
      }, []);

      cb(null, `module.exports = ${JSON.stringify(assetData)};`);
    }
  });
}
