import { FlatCompat } from "@eslint/eslintrc";
import type { ConfigWithExtends } from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export const cursorlessOrgConfig: ConfigWithExtends = {
  files: ["packages/cursorless-org/**/*"],

  extends: [compat.extends("next/core-web-vitals")],

  settings: {
    next: {
      rootDir: "packages/cursorless-org",
    },
  },
};
