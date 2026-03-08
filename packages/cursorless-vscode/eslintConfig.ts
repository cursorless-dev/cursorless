import type { ConfigWithExtends } from "@eslint/config-helpers";

export const cursorlessVscodeConfig: ConfigWithExtends = {
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
};
