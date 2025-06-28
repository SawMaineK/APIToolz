module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  plugins: ['react-refresh'],
  settings: { react: { version: 'detect' } },
  parserOptions: { ecmaVersion: 2023, sourceType: 'module' },
  env: { browser: true, es2022: true, node: true },
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
};
