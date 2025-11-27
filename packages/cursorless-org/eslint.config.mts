import type { ConfigWithExtends } from "@eslint/config-helpers";
import nextVitals from "eslint-config-next/core-web-vitals";
import tsEslint from "typescript-eslint";

export const cursorlessOrgConfig: ConfigWithExtends = {
  files: ["packages/cursorless-org/**/*"],

  extends: nextVitals,

  languageOptions: {
    parser: tsEslint.parser,
  },

  settings: {
    next: {
      rootDir: "packages/cursorless-org",
    },
  },
};
