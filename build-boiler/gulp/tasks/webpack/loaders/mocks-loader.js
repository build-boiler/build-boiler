/**
 * Webpack loader used for "SERVER" build to load local
 * assets such as Images and CSS from the stats created
 * by Webpack Isomporphic Tools
 * @param {Buffer} content
 * @return {undefined} uses the `cb` callback to pass data to the `compiler`
 */
export default function(content) {
  const mocks = [
    {
      re: /(?:global|window)?\.?ga\(/,
      sub: 'global.ga = () => {}'
    },

    {
      re: /(?:global|window)?\.?Raven\.captureException\(/,
      sub: 'global.Raven = {captureException: () => {}}'
    },

    {
      re: /(?:global|window)?\.?optimizely\./,
      sub: 'global.optimizely = {push: () => {}}'
    },

    {
      re: /navigator\..+$/,
      sub: `navigator = {
        userAgent: '',
        geolocation: {
          getCurrentPosition() {}
        }
      }`
    },

    {
      re: /(?:global|window)?\.?silverpop\./,
      sub: 'global.silverpop = {trackEvent: () => {}, flush: () => {}}'
    },

    {
      re: /document\.?(?:cookie|documentElement)?/,
      sub: `global.document = {
        get cookie() {
          return '';
        },
        set cookie(val) {},
        cookie: {
          split() {}
        },
        documentElement: {
          style: {}
        }
      }`
    }
  ];

  const mockSubs = mocks.reduce((str, data) => {
    const {re, sub} = data;

    if (re.test(content)) {
      str = `\n${sub}\n` + str;
    }

    return str;
  }, '');

  return mockSubs + content;
}
