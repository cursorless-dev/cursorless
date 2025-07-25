import type { ConfigWithExtends } from "typescript-eslint";

export const cursorlessEngineConfig: ConfigWithExtends = {
  files: ["packages/cursorless-engine/**/*.ts"],

  ignores: ["**/src/scripts/**", "**/src/testUtil/**", "**/*test.ts"],

  rules: {
    "import/no-nodejs-modules": "error",
  },
};
