import { defineConfig } from "oxlint";

const disabledRules = [
  "eslint/arrow-body-style",
  "eslint/capitalized-comments",
  "eslint/class-methods-use-this",
  "eslint/complexity",
  "eslint/id-length",
  "eslint/init-declarations",
  "eslint/max-classes-per-file",
  "eslint/max-lines-per-function",
  "eslint/max-lines",
  "eslint/max-params",
  "eslint/max-statements",
  "eslint/no-console",
  "eslint/no-continue",
  "eslint/no-eq-null",
  "eslint/no-magic-numbers",
  "eslint/no-negated-condition",
  "eslint/no-plusplus",
  "eslint/no-ternary",
  "eslint/no-undefined",
  "eslint/no-use-before-define",
  "eslint/no-void",
  "eslint/prefer-destructuring",
  "eslint/sort-imports",
  "eslint/sort-keys",
  "eslint/sort-vars",
  "func-style",
  "import/exports-last",
  "import/group-exports",
  "import/max-dependencies",
  "import/no-named-export",
  "import/no-namespace",
  "import/no-nodejs-modules",
  "import/no-relative-parent-imports",
  "import/prefer-default-export",
  "oxc/no-async-await",
  "oxc/no-optional-chaining",
  "oxc/no-rest-spread-properties",
  "promise/avoid-new",
  "promise/prefer-await-to-callbacks",
  "react-perf/jsx-no-new-function-as-prop",
  "react/jsx-max-depth",
  "react/no-multi-comp",
  "react/only-export-components",
  "react/react-in-jsx-scope",
  "typescript/explicit-function-return-type",
  "typescript/parameter-properties",
  "typescript/prefer-readonly-parameter-types",
  "typescript/promise-function-async",
  "typescript/strict-void-return",
  "unicorn/filename-case",
  "unicorn/no-array-callback-reference",
  "unicorn/no-array-for-each",
  "unicorn/no-null",
  "unicorn/prefer-at",
  "unicorn/prefer-module",
  "unicorn/prefer-spread",
  "unicorn/prefer-ternary",
  "unicorn/switch-case-braces",
];

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  ignorePatterns: [
    "resources/playground/**",
    "packages/app-neovim/cursorless.nvim/**",
    "packages/app-vscode/src/keyboard/grammar/generated/**",
    "packages/lib-engine/src/customCommandGrammar/generated/**",
    "packages/lib-engine/src/snippets/vendor/**",
  ],
  options: {
    typeAware: true,
    typeCheck: false,
  },
  plugins: [
    "eslint",
    "typescript",
    "unicorn",
    "oxc",
    "import",
    "node",
    "promise",
    "react",
    "react-perf",
  ],
  jsPlugins: [
    {
      name: "mocha",
      specifier: "eslint-plugin-mocha",
    },
  ],

  rules: {
    ...Object.fromEntries(disabledRules.map((r) => [r, "off"])),
    curly: "warn",
    eqeqeq: [
      "warn",
      "always",
      {
        null: "never",
      },
    ],
    "eslint/no-constant-condition": [
      "warn",
      {
        checkLoops: false,
      },
    ],
    "eslint/no-restricted-imports": [
      "warn",
      {
        paths: [
          {
            name: "node:assert",
            message: "Use node:assert/strict instead",
          },
        ],
        patterns: [
          {
            group: ["../*/src", "../*/src/*", "../../*/src", "../../*/src/*"],
            message: "Relative package imports are not allowed",
          },
        ],
      },
    ],
    "eslint/no-throw-literal": "warn",
    "eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
    "import/no-duplicates": "warn",
    "mocha/no-exclusive-tests": "warn",
    "mocha/no-pending-tests": "warn",
    "no-warning-comments": [
      "warn",
      {
        terms: ["todo"],
      },
    ],
    "typescript/consistent-type-assertions": [
      "warn",
      {
        assertionStyle: "as",
      },
    ],
    "typescript/consistent-type-imports": "warn",
    "typescript/no-base-to-string": "off",
    "typescript/restrict-template-expressions": "off",
    "typescript/unbound-method": "off",
    "unicorn/prefer-module": "warn",
    "unicorn/prefer-node-protocol": "warn",
    "unicorn/throw-new-error": "warn",
  },

  overrides: [
    {
      files: ["packages/app-vscode/src/scripts/**/*.ts"],
      rules: {
        "no-restricted-imports": [
          "warn",
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

    {
      files: ["packages/lib-common/**/*.ts", "packages/lib-engine/**/*.ts"],
      rules: {
        "import/no-nodejs-modules": "warn",
      },
    },

    {
      files: [
        "packages/lib-common/**/*.test.ts",
        "packages/lib-engine/**/*.test.ts",
        "packages/lib-engine/src/scripts/**/*.ts",
        "packages/lib-engine/src/testUtil/**/*.ts",
      ],
      rules: {
        "import/no-nodejs-modules": "off",
      },
    },

    {
      files: ["packages/lib-common/src/types/command/**/*.ts"],
      rules: {
        "eslint/no-restricted-imports": [
          "warn",
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
  ],
});
