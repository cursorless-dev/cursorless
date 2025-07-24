import eslintJs from "@eslint/js";
import eslintPrettier from "eslint-config-prettier/flat";
import path from "node:path";
import eslintTs from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";
import importPlugin from "eslint-plugin-import";
import mochaPlugin from "eslint-plugin-mocha";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import type { Linter } from "eslint";
import cursorlessOrgConfig from "./packages/cursorless-org/eslint.config.mts";

export default eslintTs.config(
  {
    ignores: [
      "**/generated/**/*",
      "**/out/**/*",
      "**/dist/**/*",
      "**/build/**/*",
      "**/vendor/**/*",
      "**/.next/**/*",
      "**/.docusaurus/**/*",
      "data/playground/**/*",
    ],
  },
  eslintJs.configs.recommended,
  // We want to enable this in the long run. For now there are a lot of errors that needs to be handled.
  // eslintTs.configs.recommendedTypeChecked,
  eslintTs.configs.recommended,
  eslintPrettier,
  {
    plugins: {
      "unused-imports": unusedImports,
      import: importPlugin,
      unicorn: eslintPluginUnicorn,
      mocha: mochaPlugin,
    },

    languageOptions: {
      parser: eslintTs.parser,
      ecmaVersion: 6,
      sourceType: "module",
      parserOptions: {
        project: true,
      },
    },

    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
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
      "mocha/no-pending-tests": "error",
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
      ],
    },
  },
  {
    files: [
      "**/jest.config.ts",
      "**/docusaurus.config.mts",
      "**/mdx-components.tsx",
      "**/scripts/**",
      "**/resources/**",
      "typings/**",
      "**/*.js",
      "**/*.mjs",
      "eslint.config.mts",
    ],

    extends: [eslintTs.configs.disableTypeChecked],
  },
  cursorlessOrgConfig,
);
