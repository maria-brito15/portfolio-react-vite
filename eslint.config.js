import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'dist',
      'docs',
      'node_modules',
      'coverage',
      'playwright-report',
      'test-results',
      'e2e/shots',
      '.next',
      'next-env.d.ts',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    plugins: {
      react,
      'react-hooks': reactHooks,
      '@stylistic': stylistic,
    },

    settings: {
      react: { version: 'detect' },
    },

    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,

      // React
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',

      // TypeScript
      '@typescript-eslint/no-explicit-any': 'off',

      // Code formatting
      '@stylistic/padding-line-between-statements': [
        'error',

        // Linha em branco antes de return
        {
          blankLine: 'always',
          prev: '*',
          next: 'return',
        },

        // Separar declarações de variáveis de estruturas de controle
        {
          blankLine: 'always',
          prev: ['const', 'let'],
          next: ['if', 'for', 'while', 'switch', 'try', 'return'],
        },
        {
          blankLine: 'always',
          prev: ['if', 'for', 'while', 'switch', 'try'],
          next: ['const', 'let', 'return'],
        },

        // Separar etapas de execução
        {
          blankLine: 'always',
          prev: 'expression',
          next: ['const', 'let'],
        },
        {
          blankLine: 'always',
          prev: ['const', 'let'],
          next: 'expression',
        },

        // Separar laços independentes
        {
          blankLine: 'always',
          prev: 'for',
          next: 'for',
        },
      ],
    },
  },

  // Conteúdo é dado puro (design TD-002): um `*.content.ts` só importa outro arquivo de conteúdo
  // ou tipos (`import type`). Nada de função, componente nem biblioteca dentro do dado.
  {
    files: ['src/content/**/*.content.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "ImportDeclaration[importKind!='type'][source.value!=/[.]content$/]",
          message: 'Arquivo de conteúdo só importa outro *.content ou usa `import type`.',
        },
        {
          selector:
            "ExportNamedDeclaration[source][exportKind!='type'][source.value!=/[.]content$/]",
          message: 'Arquivo de conteúdo só reexporta de outro *.content ou usa `export type`.',
        },
        {
          selector: "ExportAllDeclaration[exportKind!='type'][source.value!=/[.]content$/]",
          message: 'Arquivo de conteúdo só reexporta de outro *.content ou usa `export type`.',
        },
        {
          selector: 'ImportExpression',
          message: 'Arquivo de conteúdo não usa import dinâmico.',
        },
      ],
    },
  },
];
