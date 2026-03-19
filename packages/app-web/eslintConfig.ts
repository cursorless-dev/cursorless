import type { ConfigWithExtends } from "@eslint/config-helpers";
import tsEslint from "typescript-eslint";

export const cursorlessOrgConfig: ConfigWithExtends = {
  files: ["packages/app-web/**/*"],

  languageOptions: {
    parser: tsEslint.parser,
  },
};
