import type { ConfigWithExtends } from "@eslint/config-helpers";
import tsEslint from "typescript-eslint";

export const cursorlessOrgConfig: ConfigWithExtends = {
  files: ["packages/cursorless-org/**/*"],

  languageOptions: {
    parser: tsEslint.parser,
  },
};
