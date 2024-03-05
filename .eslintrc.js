// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [ '@stylistic', '@stylistic/js', '@stylistic/ts' ],
  rules: {
    '@stylistic/ts/indent': [ 'error', 2 ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-floating-promises': [ 0, {
      ignoreVoid: true
    } ],
    "@typescript-eslint/naming-convention": [ 0 ],
    "@typescript-eslint/no-unused-vars": [ 1 ],
    "object-curly-spacing": [
      "error",
      "always",
      {
        "arraysInObjects": true,
        "objectsInObjects": true
      }
    ],
    "@stylistic/array-bracket-spacing": [ "error", "always" ],
    "@stylistic/semi-spacing": [ "error", { "before": false, "after": true } ],
    "@stylistic/semi": [ "error", "always" ],
    "@stylistic/no-trailing-spaces": [ "error", { "skipBlankLines": true } ],
    "@stylistic/no-multi-spaces": [ "error", { ignoreEOLComments: false } ],
    "no-mixed-operators": [
      "error",
      {
        "groups": [
          [ "+", "-", "*", "/", "%", "**" ],
          [ "&", "|", "^", "~", "<<", ">>", ">>>" ],
          [ "==", "!=", "===", "!==", ">", ">=", "<", "<=" ],
          [ "&&", "||" ],
          [ "in", "instanceof" ]
        ],
        "allowSamePrecedence": true
      }
    ],
    "@stylistic/member-delimiter-style": [ 'error' ],
    "@stylistic/js/no-multiple-empty-lines": [ 'error', { max: 1 } ],
    "@typescript-eslint/no-explicit-any": [ 1 ]
  }
};