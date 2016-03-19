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
      sub: 'global.ga = function() {};'
    },
    {
      re: /(?:global|window)?\.?Raven\.captureException\(/,
      sub: 'global.Raven = {captureException: function() {}};'
    },

    {
      re: /(?:global|window)?\.?optimizely\./,
      sub: 'global.optimizely = {push: function() {}};'
    },
    {
      re: /(?:global|window)?\.?silverpop\./,
      sub: 'global.silverpop = {trackEvent: function() {}, flush: function() {}};'
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
