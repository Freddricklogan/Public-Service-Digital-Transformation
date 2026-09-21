import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['site/**', 'coverage/**', 'node_modules/**', 'docs/assets/shell/**'] },
  js.configs.recommended,
  { files: ['docs/assets/**/*.js'], languageOptions: { sourceType: 'module', globals: { ...globals.browser } }, rules: { 'no-console': ['warn', { allow: ['warn', 'error'] }] } },
  { files: ['tests/**/*.js'], languageOptions: { sourceType: 'module', globals: { ...globals.node } } }
];
