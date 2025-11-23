import type { ConfigWithExtends } from "@eslint/config-helpers";
import nextVitals from "eslint-config-next/core-web-vitals";

export const cursorlessOrgConfig: ConfigWithExtends = {
  files: ["packages/cursorless-org/**/*"],

  extends: nextVitals,

  settings: {
    next: {
      rootDir: "packages/cursorless-org",
    },
  },
};
