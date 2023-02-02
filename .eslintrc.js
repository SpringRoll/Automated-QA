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
    "multiline-comment-style": ["error", "starred-block"],
    "spaced-comment": ["error", "always"]
  }
};
