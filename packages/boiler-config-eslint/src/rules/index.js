export default {
  parser: 'babel-eslint',
  extends: [
    'eslint-config-airbnb'
  ].map(require.resolve),
  ecmaFeatures: {
    experimentalObjectRestSpread: true
  },
  rules: {
    'one-var-declaration-per-line': ['error', 'initializations'],
    'one-var': [2, {
      uninitialized: 'always',
      initialized: 'never'
    }],
    semi: ['warn', 'always'],
    'default-case': 0,
    'func-names': 0,
    'no-case-declarations': 0,
    'prefer-template': 0,
    'no-param-reassign': 0,
    'consistent-return': 0,
    'import/prefer-default-export': 0,
    'import/newline-after-import': 0,
    'no-unused-vars': ['error', { vars: 'all', args: 'none' }],
    'no-confusing-arrow': 0,
    'space-before-function-paren': ['error', 'never'],
    'no-underscore-dangle': 0,
    'no-shadow': 0,
    'no-mixed-operators': ['error', {
      groups: [
        ['&', '|', '^', '~', '<<', '>>', '>>>']
      ]
    }],
    'import/no-extraneous-dependencies': 0,
    'babel/arrow-parens': 0,
    'arrow-body-style': 0,
    'global-require': 0,
    'object-curly-spacing': 0,
    'prefer-arrow-callback': 0,
    'comma-dangle': ['error', 'never'],
    'import/extensions': ['error', 'always', {
      js: 'never',
      jsx: 'never',
      json: 'never',
      mjs: 'never'
    }],
    'import/no-dynamic-require': 0,
    'spaced-comment': 0,
    'arrow-parens': 0,
    'quote-props': 0,
    'padded-blocks': 0,
    'object-shorthand': 0,
    'wrap-iife': 0,
    'no-useless-constructor': 0,
    'space-in-parens': 0,
    'prefer-rest-params': 0,
    'class-methods-use-this ': 0,
    'generator-star-spacing': 0,
    'max-len': 0,
    'quotes': ['error', 'single', {
      allowTemplateLiterals: true
    }],
    'new-cap': 0,
    'class-methods-use-this': 0,
    'no-extra-boolean-cast': 0,
    'no-restricted-syntax': [
      'error',
      'LabeledStatement',
      'WithStatement'
    ],
    'no-plusplus': 0,
    'import/imports-first': 0,
    'no-return-assign': 0,
    'computed-property-spacing': 0,
    'react/jsx-filename-extension': 0,
    'prefer-spread': 0,
    'no-useless-escape': 0,
    'no-useless-concat': 0,
    'no-unneeded-ternary': 0,
    'block-spacing': 0,
    'no-prototype-builtins': 0,
    'import/no-named-as-default-member': 0,
    'import/no-named-as-default': 0
  },
  env: {
    browser: true,
    node: true
  },
  globals: {
    describe: true,
    it: true,
    before: true,
    after: true,
    beforeEach: true,
    afterEach: true,
    expect: true,
    should: true,
    $: true,
    jQuery: true,
    Modernizr: true,
    _fbq: true,
    FB: true,
    ga: true,
    templateVars: true,
    _usq: true,
    optimizely: true
  }
};
