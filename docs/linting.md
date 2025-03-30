# Linting Configuration for Camera App

## Chosen Linter and Justification

I use **ESLint** as the primary linter for my React Native app. ESLint was chosen because:
- It provides extensive support for JavaScript and React Native.
- It offers a flexible configuration with plugins for security, accessibility, and performance.
- It integrates well with Prettier for consistent code formatting.
- It helps catch common errors, enforcing best practices automatically.

## Base Rules and Explanation

ESLint configuration enforces rules across four key areas:

### 1. Code Style (Consistency & Readability)
- **Prettier Integration** (`prettier/prettier: error`) - Ensures consistent formatting.
- **Import Order** (`import/order: error`) - Enforces organized imports with newlines.

### 2. Security (Preventing Vulnerabilities)
- **No eval() Usage** (`no-eval: error`) - Prevents execution of arbitrary code.
- **Security Plugin Rules:**
  - `security/detect-eval-with-expression: error` - Detects potentially dangerous eval use.
  - `security/detect-non-literal-require: warn` - Warns against dynamic imports.
  - `security/detect-object-injection: warn` - Prevents prototype pollution risks.
- **Promise Handling:**
  - `promise/catch-or-return: error` - Ensures promises are properly handled.

### 3. Performance (Optimizing App Execution)
- **React Hooks Rules:**
  - `react-hooks/rules-of-hooks: error` - Enforces correct hook usage.
  - `react-hooks/exhaustive-deps: warn` - Ensures correct dependencies in useEffect.
- **React Native Performance Rules:**
  - `react-native/no-inline-styles: warn` - Avoids unnecessary inline styles.
  - `react-native/no-unused-styles: warn` - Detects unused styles.

### 4. Accessibility (Making the App Inclusive)
- **JSX A11y Rules:**
  - `jsx-a11y/alt-text: warn` - Ensures images have alternative text.
  - `jsx-a11y/no-static-element-interactions: warn` - Prevents interactions on non-interactive elements.
  - `jsx-a11y/anchor-is-valid: warn` - Validates anchor elements.

## Ignored Files
To prevent unnecessary linting errors, the following files and directories are ignored:
```
node_modules/
e2e/
build/
expo/
__mocks__/
babel.config.js
detox.config.js
detox.setup.js
eas.json
package.json
package-lock.json
jest.config.js
tsconfig.js
```

## Running the Linter

To check for linting errors, run:
```sh
npx eslint .
```

To automatically fix fixable issues, run:
```sh
npx eslint . --fix
```
---
Following these guidelines will ensure better maintainability, security, and performance for the Camera App. 🚀

