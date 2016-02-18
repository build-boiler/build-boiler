import {merge} from 'lodash';
import path from 'path';
import WebpackIsomorphicToolsPlugin from 'webpack-isomorphic-tools/plugin';

export default function({isMainTask, environment, sources, debug}) {
  //const {isDev} = environment;
  const {statsFile, globalStatsFile, buildDir} = sources;
  const toolsFile = `../${path.join(buildDir, isMainTask ? statsFile : globalStatsFile)}`;
  const defaultConfig = {
    debug,
    webpack_assets_file_path: toolsFile
  };

  const config = {
    isomporphic: {
      assets: {
        images: {
          extensions: [
            'jpeg',
            'jpg',
            'png',
            'gif',
            'svg'
          ],
          parser: WebpackIsomorphicToolsPlugin.url_loader_parser
        },
        styles: {
          extensions: ['css', 'scss'],
          filter(module, regex, options, log) {
            //TODO: update parser to handle local CSS from @hfa modules
            return WebpackIsomorphicToolsPlugin.style_loader_filter(module, regex, options, log);
          },
          path(module, options, log) {
            return WebpackIsomorphicToolsPlugin.style_loader_path_extractor(module, options, log);
          },
          parser(module, options, log) {
            return WebpackIsomorphicToolsPlugin.css_modules_loader_parser(module, options, log);
          }
        }
      }
    },
    global: {
      assets: {
        images: {
          extensions: [
            'jpeg',
            'jpg',
            'svg',
            'png',
            'gif'
          ],
          filter(m, regex, options, log) {
            const {name} = m;
            return regex.test(name);
          },
          parser(m, options, log) {
            const {publicPath} = options.webpack_stats;
            const [fullName] = m.assets;
            return process.env.TRAVIS_BRANCH ? publicPath  +  fullName : `/${fullName}`;
          },
          path(m, options, log) {
            const {name} = m;
            const base = path.basename(name);
            return base;
          }
        }
      }
    }
  };

  const toolsConfig = isMainTask ? config.isomporphic : config.global;

  return merge({}, defaultConfig, toolsConfig);
}
