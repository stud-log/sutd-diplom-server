module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json']
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    
    indent: [2, 2],
    
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-floating-promises': [1, {
      ignoreVoid: true
    }],
    "@typescript-eslint/naming-convention": [0],
    "@typescript-eslint/no-unused-vars": [1]
  }
};