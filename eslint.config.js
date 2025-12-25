import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';
import {globalIgnores} from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default tseslint.config(
  globalIgnores(['Sam.TypeScript.Ezra.Todo.Client/dist']),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ['Sam.TypeScript.Ezra.Todo.Client/**/*.{ts,tsx}'],
    plugins: {
      'react-refresh': reactRefresh,
      prettier: eslintPluginPrettier,
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        {allowConstantExport: true},
      ],
      'prettier/prettier': 'error',
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
  },
  eslintConfigPrettier,
);
