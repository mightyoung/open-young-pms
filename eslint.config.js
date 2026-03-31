import js from '@eslint/js'
import babelParser from '@babel/eslint-parser'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'

const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  location: 'readonly',
  history: 'readonly',
  localStorage: 'readonly',
  sessionStorage: 'readonly',
  fetch: 'readonly',
  FormData: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  CustomEvent: 'readonly',
  FileReader: 'readonly',
  File: 'readonly',
  Blob: 'readonly',
  Image: 'readonly',
  setTimeout: 'readonly',
  setInterval: 'readonly',
  clearTimeout: 'readonly',
  clearInterval: 'readonly',
  console: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
  matchMedia: 'readonly',
  MutationObserver: 'readonly',
  IntersectionObserver: 'readonly',
}

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react'],
        },
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...browserGlobals,
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'react/jsx-no-target-blank': 'warn',
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  prettier,
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', 'vitest.config.js'],
  },
]
