import resolver from '../utils/resolver';

export default {
  extends: [
    '../rules/index.js',
    '../rules/react-rules.js'
  ].map(resolver(__dirname)),
  rules: {
    'no-console': 1,
    'no-debugger': 1,
    'no-alert': 1,
    'no-unused-expressions': [2, {
      allowShortCircuit: true,
      allowTernary: true
    }],
    'no-unused-vars': [2, {
      'vars': 'local',
      'args': 'none'
    }],
    'semi': [2, 'always'],
    'indent': [2, 2,
      {
        'SwitchCase': 1
      }
    ],
    'import/no-unresolved': 0,
    'import/extensions': 0
  }
};
