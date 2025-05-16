// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import jsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  // Global ignores - apply to all subsequent configurations
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.turbo/**',
      '.next/**',
      'eslint.config.js', // Ignoring self
      'vite.config.ts',
      'postcss.config.js',
      'tailwind.config.js',
    ],
  },

  // 1. Base ESLint recommended rules
  eslint.configs.recommended,

  // 2. Base TypeScript configurations (non-type-aware)
  // This includes the parser and basic TS rules. Spread the array of configs.
  ...tseslint.configs.recommended,

  // 3. Type-aware linting configurations from tseslint
  // Spread the array of configs for strict type-checking.
  // These configs typically set up the parser and enable type-aware rules.
  ...tseslint.configs.strictTypeChecked, // Or use recommendedTypeChecked for less strictness

  // 4. Provide TypeScript project information for type-aware rules
  // This configuration object specifically tells the parser where to find your tsconfig files.
  // It should apply to the files covered by the type-aware rules.
  {
    files: ['src/**/*.{ts,tsx}'], // Target your TypeScript source files
    languageOptions: {
      // The parser should already be set by tseslint.configs.recommended/strictTypeChecked
      // parser: tseslint.parser, 
      parserOptions: {
        project: ['tsconfig.json', 'tsconfig.app.json'], // Paths to your tsconfig files
        tsconfigRootDir: import.meta.dirname, // Root directory for resolving tsconfig paths
                                              // For ESM, import.meta.dirname is available.
                                              // If issues arise, alternatives:
                                              // project: true (for auto-detection, might need tsconfigRootDir)
                                              // project: ['./tsconfig.app.json'] (if eslint.config.js is in project root)
      },
    },
    // Rules enabled by strictTypeChecked are already active for these files.
    // You can add overrides or additional type-aware rules here if needed.
  },

  // 5. Configuration for React files (JSX/TSX)
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'], // Target all relevant React files
    ...reactRecommended, // Apply base React recommended rules
    ...jsxRuntime,       // Apply rules for the new JSX transform
    languageOptions: {
      // The TypeScript parser is likely already set for .ts/tsx files from above.
      // For .js/jsx files, if not using TS parser, ensure appropriate JS parser settings.
      globals: {
        ...globals.browser, // Define browser global variables
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh, // For Vite's Fast Refresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules, // Enable react-hooks recommended rules
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/prop-types': 'off', // Not needed with TypeScript
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform (React 17+)
      // Add any other React-specific rule overrides here
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
    },
  },
  
  // 6. Prettier config - MUST be last to override other formatting rules
  eslintConfigPrettier,
);
