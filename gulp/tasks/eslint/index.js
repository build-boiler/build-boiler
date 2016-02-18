export default function(gulp, plugins, config, opts) {
  const {rules, configFile} = opts;

  return {
    rules,
    configFile
  };
}
