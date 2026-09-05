// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import jsdocPlugin from 'eslint-plugin-jsdoc';

/**
 * Root ESLint configuration for fullstack project.
 * Defines naming conventions, JSDoc requirements, line count limits, and code quality standards.
 * This configuration serves as the North Star for coding standards across backend and frontend.
 */
export default tseslint.config(
  // Base recommended configs
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  
  // Global ignore patterns
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/.vite/**',
      '**/generated/**',
      '**/__pycache__/**',
      '**/certs/**',
      '**/signed-documents/**',
      '**/scripts/**',
      'print-agent/**', // Standalone Node.js service for remote printing
      // Don't lint config files themselves
      'eslint.config.mjs',
      'backend/eslint.config.mjs',
      'frontend/eslint.config.mjs',
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
    ],
  },

  // Main configuration for TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs'],
    
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      react: reactPlugin,
      'jsx-a11y': jsxA11yPlugin,
      jsdoc: jsdocPlugin,
    },

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        // Node globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        // Test globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          noWarnOnMultipleProjects: true,
          project: [
            './backend/tsconfig.json',
            './frontend/tsconfig.json',
          ],
        },
      },
    },

    rules: {
      /* ---------- line-count rules (defaults) ---------- */
      'max-lines': [
        'error',
        {
          max: 300,
          skipBlankLines: true,
          skipComments: true,
        },
      ],

      /* ---------- comment style / JSDoc (Google-like guidance) ---------- */
      'spaced-comment': [
        'error',
        'always',
        {
          line: {
            markers: ['/'],
          },
          block: {
            balanced: true,
          },
        },
      ],
      'multiline-comment-style': ['warn', 'separate-lines'],
      'jsdoc/check-alignment': 'error',
      'jsdoc/check-indentation': 'error',
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
          contexts: [
            'ExportNamedDeclaration > FunctionDeclaration',
            'ExportDefaultDeclaration > FunctionDeclaration',
            'ExportNamedDeclaration > ClassDeclaration',
            'ExportDefaultDeclaration > ClassDeclaration',
          ],
          exemptEmptyConstructors: true,
          exemptEmptyFunctions: false,
          checkConstructors: true,
        },
      ],
      'jsdoc/require-description': 'off', // Too strict for WIP features
      'jsdoc/require-description-complete-sentence': 'off', // Too strict for WIP features

      /* ---------- naming conventions (Google-style preferences) ---------- */
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE', 'PascalCase'],
        },
        {
          selector: 'property',
          format: null, // Allow any format for object properties (HTTP headers, AWS config, etc.)
          leadingUnderscore: 'allow',
        },
        {
          selector: 'method',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allowSingleOrDouble', // Allow _ and __ for unused params
        },
      ],

      /* ---------- misc safety & style helpful for fullstack TS ---------- */
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': [
        'error',
        {
          ignoreRestArgs: false, // SAP-level strictness: no exceptions
          fixToUnknown: true, // Suggest 'unknown' instead
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      
      'import/order': [
        'warn', // Demoted from error - auto-fix can be unreliable in monorepos
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
          ],
          'newlines-between': 'always',
        },
      ],

      // React rules (for frontend)
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
  
  // React Components - TypeScript interfaces document props, JSDoc not needed
  {
    files: ['**/*.tsx'],
    rules: {
      'jsdoc/require-jsdoc': 'off', // React components use TypeScript for prop documentation
    },
  },

  // Frontend-specific overrides
  {
    /* frontend: small UI components and hooks — tighter component limit */
    files: [
      'frontend/src/components/**/*.tsx',
      'frontend/src/hooks/**/*.ts',
      'frontend/src/utils/**/*.ts',
    ],
    rules: {
      'max-lines': [
        'error',
        {
          max: 200,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  {
    /* frontend: table components with complex state management */
    files: [
      'frontend/src/components/**/*Table.tsx',
      'frontend/src/components/**/*ItemsTable.tsx',
      'frontend/src/components/**/*Content.tsx', // Invoice/Challan/Voucher content pages with filters
    ],
    rules: {
      'max-lines': [
        'warn', // Warn instead of error for table components
        {
          max: 300, // Allow larger files for complex table logic
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  {
    /* frontend: preview/complex UI components with state management */
    files: [
      'frontend/src/components/**/Preview.tsx',
      'frontend/src/components/**/Viewer.tsx',
      'frontend/src/components/**/*Modal.tsx',
      'frontend/src/components/**/InvoicePreview.tsx',
      'frontend/src/components/**/ChallanPreview.tsx',
      'frontend/src/components/**/VoucherPreview.tsx',
      'frontend/src/components/invoices/InvoiceViewer.tsx',
      'frontend/src/components/challans/ChallanViewer.tsx',
      'frontend/src/components/vouchers/VoucherViewer.tsx',
      'frontend/src/components/**/templates/**/*.tsx',
    ],
    rules: {
      'max-lines': [
        'warn', // Warn instead of error for complex UI
        {
          max: 500, // Allow larger files for complex layouts
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  {
    /* frontend: pages/containers may be larger but warn when big */
    files: [
      'frontend/src/pages/**/*.tsx',
      'frontend/src/containers/**/*.tsx',
    ],
    rules: {
      'max-lines': [
        'warn',
        {
          max: 400, // Increased from 350 - pages have routing + state + UI
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },

  // Backend-specific overrides
  {
    /* backend controllers should be small - delegate to services */
    files: [
      '**/backend/src/**/controllers/**/*.ts',
      '**/backend/src/**/*.controller.ts',
    ],
    rules: {
      'max-lines': [
        'error',
        {
          max: 250, // Auth controller has many endpoints (login, 2FA, password reset)
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
  {
    /* backend services / modules can be larger */
    files: [
      '**/backend/src/**/services/**/*.ts',
      '**/backend/src/**/*.service.ts',
    ],
    rules: {
      'max-lines': [
        'error',
        {
          max: 400,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },

  {
    /* backend core services have complex business logic */
    files: ['**/backend/src/core/**/*.service.ts'],
    rules: {
      // Complex business logic may have large files
    },
  },

  {
    /* backend entities use descriptive property names for DB schemas */
    files: [
      '**/backend/src/**/entities/**/*.ts',
      '**/backend/src/**/*.entity.ts',
    ],
    rules: {
      // DB entities follow schema conventions
    },
  },

  {
    /* backend document-signing module is WIP with complex PDF/cert logic */
    files: ['**/backend/src/document-signing/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'max-lines': 'off', // Complex signing flows need more space
    },
  },

  // Test files - exempt from strict rules
  {
    files: [
      '**/__tests__/**',
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/*.spec.tsx',
      '**/*.test.tsx',
      '**/test/**',
      '**/fixtures/**',
      '**/*.d.ts', // Type definition files
    ],
    rules: {
      'max-lines': 'off',
      'jsdoc/require-jsdoc': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // WIP/Experimental features - relaxed rules for incomplete code
  {
    files: [
      'frontend/src/components/FeatureRoute.tsx',
      'frontend/src/hooks/useFeature.ts',
      'frontend/src/utils/features.ts',
      'frontend/src/experimental/**',
      'backend/src/**/experimental/**',
      // Known WIP areas with placeholder code
      'frontend/src/pages/Voucher.tsx',
      'frontend/src/components/Voucher/**/*.tsx',
      'frontend/src/pages/Options.tsx',
      // Experimental backend and frontend Tara (AI voice) services
      'backend/src/tara/*.ts',
      '**/frontend/src/context/TaraContext.tsx',
      '**/frontend/src/services/taraService.ts',
      '**/tara/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off', // Allow unused imports for WIP features
      '@typescript-eslint/no-explicit-any': 'off', // Experimental SDK types not yet typed
      'jsdoc/require-jsdoc': 'off',
      'max-lines': 'off', // No line limits for experimental code
    },
  },

  // Scripts and tools - relaxed line limits
  {
    files: [
      'scripts/**/*.ts',
      'backend/src/scripts/**/*.ts',
      'tools/**/*.ts',
      'generated/**',
    ],
    rules: {
      'max-lines': [
        'warn',
        {
          max: 800,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'jsdoc/require-jsdoc': 'off',
    },
  },
);
