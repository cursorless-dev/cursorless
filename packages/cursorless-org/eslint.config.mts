import type { ConfigWithExtends } from "@eslint/config-helpers";
import nextVitals from "eslint-config-next/core-web-vitals";
import tsEslint from "typescript-eslint";

// The Next.js ESLint config includes the `import` plugin, which conflicts with our own import plugin in the root configuration.
const nextVitalsWithoutImportPlugin = nextVitals.map((config) => {
  if (config.plugins?.["import"] == null) {
    return config;
  }
  const { import: _, ...plugins } = config.plugins;
  return { ...config, plugins };
});

export const cursorlessOrgConfig: ConfigWithExtends = {
  files: ["packages/cursorless-org/**/*"],

  extends: nextVitalsWithoutImportPlugin,

  languageOptions: {
    parser: tsEslint.parser,
  },

  settings: {
    next: {
      rootDir: "packages/cursorless-org",
    },
  },
};
