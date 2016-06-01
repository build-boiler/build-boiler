/**
 * Get options for running tests on BrowserStack (via bs-tunnel)
 *
 * @param {Object} config // Task configuration
 * @return {Object}
 */
export default function getBrowserStackOptions(config) {
  const {bsConfig, local, sources, environment, pkg = {}} = config;
  const {BROWSERSTACK_USERNAME, BROWSERSTACK_API, localIdentifier} = bsConfig;
  const {devHost, devPort, hotPort} = sources;
  const {branch} = environment;
  const {name, version} = pkg;

  return {
    // Used for grouping tests on browserstack.com
    groupOptions: {
      project: `v${version} [${branch || 'local'}:e2e${local ? ':debug' : ''}]`,
      build: name
    },
    authOptions: {
      user: BROWSERSTACK_USERNAME,
      key: BROWSERSTACK_API,
      host: 'hub.browserstack.com',
      port: 80
    },
    envOptions: {
      tunnel: {
        'browserstack.local': 'true',
        'browserstack.debug': 'true',
        'browserstack.localIdentifier': localIdentifier
      },
      ci: {
        'browserstack.debug': 'true',
        'browserstack.local': 'true',
        //TODO: make this property dynamic if we have multiple
        //instances of BS binary running for VPC
        'browserstack.localIdentifier': localIdentifier
      }
    },
    spawnTunnelOptions: {
      key: BROWSERSTACK_API,
      hosts: [
        {
          name: devHost,
          port: devPort,
          sslFlag: 0
        },
        {
          name: devHost,
          port: hotPort,
          sslFlag: 0
        }
      ],
      v: true,
      localIdentifier,
      forcelocal: true
    }
  };
}
