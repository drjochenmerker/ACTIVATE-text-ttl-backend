// eslint.config.js
import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

/** @type {import("eslint").Linter.FlatConfigItem[]} */
export default [
    {
        files: ['**/*.ts'],
        plugins: {
            '@typescript-eslint': ts,
        },
        rules: {
            ...ts.configs.recommended.rules,
        },
        languageOptions: {
            parser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                console: 'readonly',
                process: 'readonly',
                fetch: 'readonly',
            },
        },
    },
    js.configs.recommended,
    prettier,
    {
        files: ['**/*.ts'],
        rules: {
            'no-unused-vars': 'off',
        },
    },
];
