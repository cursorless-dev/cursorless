/* eslint-disable import/no-relative-packages */

import type { ConfigWithExtends } from "@eslint/config-helpers";
import eslintJs from "@eslint/js";
import prettierConfig from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import mochaPlugin from "eslint-plugin-mocha";
import unicornPlugin from "eslint-plugin-unicorn";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";
import tsEslint from "typescript-eslint";
import { commonConfig } from "./packages/common/eslint.config.mts";
import { cursorlessEngineConfig } from "./packages/cursorless-engine/eslint.config.mts";
import { cursorlessOrgConfig } from "./packages/cursorless-org/eslint.config.mts";
import { cursorlessVscodeConfig } from "./packages/cursorless-vscode/eslint.config.mts";

const ignoresConfig: ConfigWithExtends = {
  ignores: [
    "**/generated/**/*",
    "**/out/**/*",
    "**/dist/**/*",
    "**/build/**/*",
    "**/vendor/**/*",
    "**/.next/**/*",
    "**/.docusaurus/**/*",
    "data/playground/**/*",
    "packages/cursorless-org/next-env.d.ts",
  ],
};

const rootConfig: ConfigWithExtends = {
  plugins: {
    "unused-imports": unusedImportsPlugin,
    import: importPlugin,
    unicorn: unicornPlugin,
    mocha: mochaPlugin,
  },

  languageOptions: {
    parser: tsEslint.parser,
    ecmaVersion: 6,
    sourceType: "module",
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },

  settings: {
    "import/resolver": {
      typescript: {
        // Always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
        alwaysTryTypes: true,
        noWarnOnMultipleProjects: true,
        project: ["tsconfig.json", "packages/*/tsconfig.json"],
      },
    },
  },

  rules: {
    "import/no-relative-packages": "error",
    "import/no-duplicates": "error",
    "unused-imports/no-unused-imports": "error",
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
};

const tsxConfig: ConfigWithExtends = {
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
};

const disabledTypeCheckConfig: ConfigWithExtends = {
  files: [
    "**/jest.config.ts",
    "**/docusaurus.config.mts",
    "**/eslint.config.mts",
    "**/mdx-components.tsx",
    "typings/**",
    "**/*.js",
    "**/*.mjs",
  ],
  extends: [tsEslint.configs.disableTypeChecked],
};

export default defineConfig(
  ignoresConfig,
  eslintJs.configs.recommended,
  // We want to enable this in the long run. For now there are a lot of errors that needs to be handled.
  // eslintTs.configs.recommendedTypeChecked,
  tsEslint.configs.recommended,
  prettierConfig,
  rootConfig,
  tsxConfig,
  disabledTypeCheckConfig,
  commonConfig,
  cursorlessEngineConfig,
  cursorlessVscodeConfig,
  cursorlessOrgConfig,
);
