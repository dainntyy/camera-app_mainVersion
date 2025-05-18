import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactNative from 'eslint-plugin-react-native';
import prettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import security from 'eslint-plugin-security';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import promise from 'eslint-plugin-promise';
import globals from 'globals';

react.configs.recommended.plugins = { react };
react.configs.recommended.languageOptions = {
  parserOptions: react.configs.recommended.parserOptions,
};
delete react.configs.recommended.parserOptions;

export default [
  js.configs.recommended,
  react.configs.recommended,
  {
    ignores: [
      'node_modules/',
      'e2e/',
      'build/',
      'expo/',
      '__mocks__/',
      'babel.config.js',
      'detox.config.js',
      'detox.setup.js',
      'eas.json',
      'package.json',
      'package-lock.json',
      'jest.config.js',
      'tsconfig.js',
      'docs/',
      'venv/',
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-native': reactNative,
      prettier,
      import: importPlugin,
      security,
      'jsx-a11y': jsxA11y,
      promise,
      jsdoc,
    },
    rules: {
      // 🔍 Основні правила JSDoc
      'jsdoc/check-alignment': 'error', // Вирівнювання тегів
      'jsdoc/check-indentation': 'warn', // Відступи
      'jsdoc/check-tag-names': 'error', // Коректність назв тегів
      'jsdoc/check-types': 'error', // Типи даних
      'jsdoc/require-jsdoc': [
        'warn',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: false,
          },
        },
      ],
      'jsdoc/require-param': 'warn', // Обов'язкові @param
      'jsdoc/require-returns': 'warn', // Обов'язковий @returns
      'jsdoc/require-description': 'warn', // Має бути опис
      // 'no-undef': 'off',
      // 1️⃣ Стиль коду (Prettier + базові ESLint правила)
      'prettier/prettier': 'error',
      'import/order': ['error', { 'newlines-between': 'always' }],

      // 2️⃣ Безпека
      'no-eval': 'error', // Забороняє використання eval()
      'security/detect-eval-with-expression': 'error', // Виявляє небезпечні eval()
      'security/detect-non-literal-require': 'warn', // Перевіряє імпорти
      'security/detect-object-injection': 'warn', // Виявляє небезпечні об'єктні доступи
      'promise/catch-or-return': 'error', // Обов’язкова обробка промісів

      // 3️⃣ Продуктивність
      'react-hooks/rules-of-hooks': 'error', // Виявляє неправильне використання хуків
      'react-hooks/exhaustive-deps': 'warn', // Запобігає зайвим ререндерам
      'react-native/no-inline-styles': 'warn', // Попереджає про використання inline-стилів
      'react-native/no-unused-styles': 'warn', // Виявляє невикористані стилі

      // 4️⃣ Доступність
      'jsx-a11y/alt-text': 'warn', // Перевіряє наявність alt у зображень
      'jsx-a11y/no-static-element-interactions': 'warn', // Запобігає інтерактивним подіям на неінтерактивних елементах
      'jsx-a11y/anchor-is-valid': 'warn', // Забезпечує правильне використання <a>
    },
    settings: {
      jsdoc: {
        mode: 'typescript', // або 'jsdoc' якщо без TS
      },
    },
  },
  configPrettier,
];
