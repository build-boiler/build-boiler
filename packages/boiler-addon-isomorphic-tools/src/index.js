import WebpackIsomorphicTools from 'webpack-isomorphic-tools';
import WebpackIsomorphicToolsPlugin from 'webpack-isomorphic-tools/plugin';
import makeToolsConfig from './config';

export default function(config) {
  const {
    isPlugin,
    environment
  } = config;
  const {isDev} = environment;
  const toolsConfig = makeToolsConfig(config);

  let tools;

  if (isPlugin) {
    tools = new WebpackIsomorphicToolsPlugin(toolsConfig).development(isDev);
  } else {
    tools = new WebpackIsomorphicTools(toolsConfig);
  }

  return tools;
}
