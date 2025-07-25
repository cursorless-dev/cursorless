import eslintJs from "@eslint/js";
import prettierConfig from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import mochaPlugin from "eslint-plugin-mocha";
import unicornPlugin from "eslint-plugin-unicorn";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import eslintTs, { type ConfigWithExtends } from "typescript-eslint";
import cursorlessOrgConfig from "./packages/cursorless-org/eslint.config.mts";

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
        // Always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
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
    "**/mdx-components.tsx",
    "**/scripts/**",
    "**/resources/**",
    "typings/**",
    "**/*.js",
    "**/*.mjs",
    "eslint.config.mts",
  ],

  extends: [eslintTs.configs.disableTypeChecked],
};

export default eslintTs.config(
  ignoresConfig,
  eslintJs.configs.recommended,
  // We want to enable this in the long run. For now there are a lot of errors that needs to be handled.
  // eslintTs.configs.recommendedTypeChecked,
  eslintTs.configs.recommended,
  prettierConfig,
  rootConfig,
  tsxConfig,
  disabledTypeCheckConfig,
  cursorlessOrgConfig,
);
