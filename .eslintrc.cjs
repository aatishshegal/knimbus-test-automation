module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'playwright'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:playwright/recommended',
    'prettier', // Ensures ESLint doesn't fight with Prettier
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    node: true,
  },
  rules: {
    // Custom rules for our enterprise framework
    'no-console': 'off', // We allow console.log in our BasePage wrappers
    '@typescript-eslint/no-floating-promises': 'error', // Prevents missing 'await' on Playwright actions
  },
  parserOptions: {
    project: './tsconfig.json',
  },
};
