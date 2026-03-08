import { fixupPluginRules } from "@eslint/compat";
import type { ConfigWithExtends } from "@eslint/config-helpers";
import nextVitals from "eslint-config-next/core-web-vitals";
import tsEslint from "typescript-eslint";

const nextVitalsCompat = nextVitals.map((config) => {
  if (config.plugins == null) {
    return config;
  }

  const plugins = { ...config.plugins };

  // The Next.js ESLint config includes the `react` plugin which is not compatible with eslint 10.
  if (plugins.react != null) {
    plugins.react = fixupPluginRules(plugins.react);
  }

  // The Next.js ESLint config includes the `import` plugin, which conflicts with our own import plugin in the root configuration.
  if (plugins.import != null) {
    delete plugins.import;
  }

  return { ...config, plugins };
});

export const cursorlessOrgConfig: ConfigWithExtends = {
  files: ["packages/cursorless-org/**/*"],

  extends: nextVitalsCompat,

  languageOptions: {
    parser: tsEslint.parser,
  },

  settings: {
    next: {
      rootDir: "packages/cursorless-org",
    },
  },
};
