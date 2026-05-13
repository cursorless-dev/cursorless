import type { OxlintConfig } from "oxlint";
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
  "eslint/no-await-in-loop",
  "eslint/no-console",
  "eslint/no-continue",
  "eslint/no-eq-null",
  "eslint/no-lonely-if",
  "eslint/no-loop-func",
  "eslint/no-magic-numbers",
  "eslint/no-negated-condition",
  "eslint/no-plusplus",
  "eslint/no-shadow",
  "eslint/no-ternary",
  "eslint/no-undefined",
  "eslint/no-underscore-dangle",
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
  "oxc/no-barrel-file",
  "oxc/no-map-spread",
  "oxc/no-optional-chaining",
  "oxc/no-rest-spread-properties",
  "promise/always-return",
  "promise/avoid-new",
  "promise/prefer-await-to-callbacks",
  "react-perf/jsx-no-new-function-as-prop",
  "react/forbid-component-props",
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
  "unicorn/no-lonely-if",
  "unicorn/no-negated-condition",
  "unicorn/no-null",
  "unicorn/no-object-as-default-parameter",
  "unicorn/no-useless-undefined",
  "unicorn/prefer-at",
  "unicorn/prefer-event-target",
  "unicorn/prefer-module",
  "unicorn/prefer-query-selector",
  "unicorn/prefer-spread",
  "unicorn/prefer-ternary",
  "unicorn/require-post-message-target-origin",
  "unicorn/switch-case-braces",
];

const plugins: OxlintConfig["plugins"] = [
  "eslint",
  "unicorn",
  "oxc",
  "import",
  "node",
  "promise",
  "react",
  "react-perf",
];

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  ignorePatterns: [
    "resources/playground/**",
    "packages/app-neovim/cursorless.nvim/**",
    "packages/app-vscode/src/keyboard/grammar/generated/**",
    "packages/lib-engine/src/customCommandGrammar/generated/**",
    "packages/lib-engine/src/snippets/vendor/**",
    "**/*.d.ts",
  ],
  options: {
    typeAware: true,
    typeCheck: false,
  },
  plugins,
  jsPlugins: [
    {
      name: "mocha",
      specifier: "eslint-plugin-mocha",
    },
  ],
  categories: {
    correctness: "warn",
    suspicious: "warn",
    pedantic: "warn",
    perf: "warn",
    style: "warn",
    restriction: "warn",
    // Disabled since nursery contains rules under development that may change
    // nursery: "warn",
  },

  rules: {
    ...Object.fromEntries(disabledRules.map((r) => [r, "off"])),
    "eslint/no-duplicate-imports": [
      "warn",
      {
        allowSeparateTypeImports: true,
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
    "eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
    "import/no-unassigned-import": [
      "warn",
      {
        allow: ["**/*.css"],
      },
    ],
    "no-warning-comments": [
      "warn",
      {
        terms: ["todo"],
      },
    ],
    "react/jsx-filename-extension": [
      "warn",
      {
        extensions: [".tsx"],
      },
    ],
    eqeqeq: [
      "warn",
      "always",
      {
        null: "never",
      },
    ],
  },

  overrides: [
    {
      files: ["**/*.{ts,cts,mts,tsx}"],
      plugins: [...plugins, "typescript"],
    },

    {
      files: ["**/*.js"],
      rules: {
        "import/unambiguous": "off",
      },
    },

    {
      files: ["**/*.ts"],
      rules: {
        "react/rules-of-hooks": "off",
      },
    },

    {
      files: ["**/*.test.ts"],
      rules: {
        "eslint/func-names": "off",
      },
    },

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
