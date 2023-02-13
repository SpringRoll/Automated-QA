module.exports = {
  env: {
    node: true,
    browser: true,
    es6: true,
    mocha: true,
  },
  extends: '@pbs/eslint-config-pbs-kids',
  parserOptions: {
    ecmaVersion: 2017,
  },
  rules: {
    'no-console': 'off',
    'pbs-kids/var-length': 'off',
  },
};
