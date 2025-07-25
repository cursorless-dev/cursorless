import type { ConfigArray } from "typescript-eslint";

export const commonConfig: ConfigArray = [
  {
    files: ["packages/common/**/*.ts"],

    ignores: ["**/*.test.ts"],

    rules: {
      "import/no-nodejs-modules": "error",
    },
  },

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
];
