module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    "airbnb-typescript/base"
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    "no-console": "off",
    "no-restricted-syntax": "off",
    "class-methods-use-this": "off",
    "no-underscore-dangle": ["error", { "allowAfterThis": true }],
    "no-param-reassign": "off",
  }
};
