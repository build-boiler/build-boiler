import resolver from '../utils/resolver';

export default {
  extends: [
    '../rules/index.js'
  ].map(resolver(__dirname)),
  rules: {
    'no-process-exit': 0,
    'no-console': 0,
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
    'comma-dangle': 2,
    'semi': [2, 'always'],
    'indent': [2, 2,
      {
        'SwitchCase': 1
      }
    ],
    'no-unneeded-ternary': 0
  }
};
