import type { ConfigWithExtends } from "@eslint/config-helpers";

export const cursorlessEngineConfig: ConfigWithExtends = {
  files: ["packages/cursorless-engine/**/*.ts"],

  ignores: ["**/src/scripts/**", "**/src/testUtil/**", "**/*test.ts"],

  rules: {
    "import/no-nodejs-modules": "error",
  },
};
