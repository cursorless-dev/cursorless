import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import _import from "eslint-plugin-import";
import mocha from "eslint-plugin-mocha";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      "**/generated/**/*",
      "**/out/**/*",
      "**/vendor/**/*.js",
      "**/vendor/**/*.ts",
      "data/playground/**/*",
    ],
  },
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:import/typescript",
      "prettier",
      "plugin:react/jsx-runtime"
    ),
  ),
  {
    plugins: {
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
      "unused-imports": unusedImports,
      import: fixupPluginRules(_import),
      unicorn,
      mocha,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 6,
      sourceType: "module",

      parserOptions: {
        project: true,
      },
    },

    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: ["tsconfig.json", "packages/*/tsconfig.json"],
        },
      },
    },

    rules: {
      "import/no-relative-packages": "error",
      "@typescript-eslint/consistent-type-imports": "error",

      "@typescript-eslint/consistent-type-assertions": [
        "error",
        {
          assertionStyle: "as",
        },
      ],

      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: ["objectLiteralProperty"],
          format: ["camelCase"],

          filter: {
            regex: "[.]",
            match: false,
          },
        },
      ],

      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "unused-imports/no-unused-imports": "error",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      curly: "error",

      eqeqeq: [
        "error",
        "always",
        {
          null: "never",
        },
      ],

      "no-constant-condition": [
        "error",
        {
          checkLoops: false,
        },
      ],

      "no-restricted-syntax": [
        "error",
        "MemberExpression[object.property.name='constructor'][property.name='name']",
      ],

      "no-throw-literal": "error",
      semi: "off",
      "unicorn/prefer-module": "error",
      "mocha/no-skipped-tests": "error",
      "mocha/no-exclusive-tests": "error",
    },
  },
  {
    files: ["**/*.tsx"],

    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: ["function"],
          format: ["PascalCase", "camelCase"],
        },
      ]
    },
  },
  ...fixupConfigRules(
    compat.extends("plugin:@typescript-eslint/disable-type-checked"),
  ).map((config) => ({
    ...config,

    files: [
      "**/jest.config.ts",
      "**/docusaurus.config.mts",
      "**/mdx-components.tsx",
      "typings/**",
    ],
  })),

  // Added from packages/cursorless-engine/eslint.config.mjs
  {
    files: ["packages/cursorless-engine/**/*.ts"],
    ignores: [
      "packages/cursorless-engine/src/scripts/**",
      "packages/cursorless-engine/src/testUtil/**",
      "packages/cursorless-engine/**/*.test.ts",
    ],
    rules: {
      "import/no-nodejs-modules": "error",
    },
  },

  // Added from packages/common/eslint.config.mjs
  {
    files: ["packages/common/**/*.ts"],
    ignores: ["packages/common/**/*.test.ts"],
    rules: {
      "import/no-nodejs-modules": "error",
    },
  },

  // Added from packages/common/src/types/command/eslint.config.mjs
  {
    files: ["packages/common/src/types/command/**/*.ts"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@cursorless/*", "../*"],
              message: "API types shouldn't have any dependencies",
            },
          ],
          paths: [
            {
              name: "@*",
              message: "API types shouldn't have any dependencies",
            },
          ],
        },
      ],
    },
  },

  // Added from packages/cursorless-engine/src/processTargets/eslint.config.mjs
  {
    files: ["packages/cursorless-engine/src/processTargets/**/*.ts"],
    rules: {
      "import/no-default-export": ["error"],
    },
  },

  // Added from packages/cursorless-vscode/src/scripts/eslint.config.mjs
  {
    files: ["packages/cursorless-vscode/src/scripts/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "vscode",
              message: "Scripts shouldn't depend on vscode",
            },
          ],
        },
      ],
    },
  },

  // Added from packages/cursorless-org/eslint.config.mjs
  {
    files: [
      "packages/cursorless-org/**/*.js",
      "packages/cursorless-org/**/*.ts",
      "packages/cursorless-org/**/*.tsx",
    ],
    ...compat.extends("next/core-web-vitals")[0],
    settings: {
      next: {
        rootDir: "packages/cursorless-org",
      },
    },
  },
];
