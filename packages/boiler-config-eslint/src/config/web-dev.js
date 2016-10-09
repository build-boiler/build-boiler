import resolver from '../utils/resolver';

export default {
  extends: [
    '../rules/index.js',
    '../rules/react-rules.js'
  ].map(resolver(__dirname)),
  rules: {
    'no-unused-vars': ['warn', { vars: 'all', args: 'none' }],
    'semi': ['warn', 'always'],
    'comma-dangle': ['warn', 'never'],
    'import/no-unresolved': 0,
    'import/extensions': 0
  }
};
