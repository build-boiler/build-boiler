import resolver from '../utils/resolver';

export default {
  extends: [
    '../rules/index.js'
  ].map(resolver(__dirname)),
  env: {
    mocha: true
  },
  rules: {
    'block-scoped-var': 0,
    'comma-dangle': 0,
    'keyword-spacing': 0,
    'no-alert': 1,
    'no-console': 1,
    'no-debugger': 1,
    'no-extra-bind': 0,
    'no-unused-expressions': 0,
    'no-unused-vars': 0,
    'no-use-before-define': 0,
    'prefer-const': 0,
    'space-before-blocks': 0
  }
};
