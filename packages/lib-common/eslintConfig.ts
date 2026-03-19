import type { ConfigWithExtendsArray } from "@eslint/config-helpers";

export const commonConfig: ConfigWithExtendsArray = [
  {
    files: ["packages/lib-common/**/*.ts"],

    ignores: ["**/*.test.ts"],

    rules: {
      "import/no-nodejs-modules": "error",
    },
  },

  {
    files: ["packages/lib-common/src/types/command/**/*.ts"],

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
];
