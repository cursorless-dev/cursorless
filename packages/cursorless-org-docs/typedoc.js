module.exports = {
  tsconfig: "../tsconfig.json",
  entryPoints: ["../packages/"],
  entryPointStrategy: "expand",

  readme: "../docs/contributing/_api-index.md",

  // typedoc-plugin-missing-exports option
  internalNamespace: "internal",

  exclude: "**/node_modules/**",

  plugin: [
    "typedoc-plugin-rename-defaults",
    "typedoc-plugin-mdn-links",
    "typedoc-plugin-missing-exports",
  ],
};
